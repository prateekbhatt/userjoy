/**
 * This worker pulls automessages that need to be run from the queue, and
 * then runs them
 */


/**
 * npm dependencies
 */

var _ = require('lodash');
var async = require('async');
var cronJob = require('cron')
  .CronJob;
var moment = require('moment');
var q = require('./queues')
  .automessage;


/**
 * Lib
 */

var Query = require('../api/lib/query');


/**
 * Models
 */

// WARNING: include Account model because running it from 'workers' directory which
// is outside fails. Because, 'sender' account is being populated, and
// mongoose not able to find Account model
var Account = require('../api/models/Account');

var App = require('../api/models/App');
var AutoMessage = require('../api/models/AutoMessage');
var Event = require('../api/models/Event');
var Segment = require('../api/models/Segment');


/**
 * Services
 */

var sendAutomessage = require('../api/services/automessage');


/**
 * Helpers
 */

var logger = require('../helpers/logger');
var QueueError = require('../helpers/queue-error');


/**
 * Lib
 */

var createEventAndIncrementCount = require(
  '../api/lib/create-automessage-event-and-increment-count');


/**
 * Hourly Cron Job
 */

var HOURLY_SCHEDULE = '0 * * * *';


/**
 * Per Minute Cron
 */

var MINUTE_SCHEDULE = '*/1 * * * *';


// TODO: THIS CODE NEEDS TO BE MANAGED IN INSIDE THE APPS CONFIG FILE
var SCHEDULE = MINUTE_SCHEDULE;
if (process.env.NODE_ENV === 'production') {
  SCHEDULE = HOURLY_SCHEDULE;
}


/**
 * After the query is run, we get a set of all the users that match the segment
 * filters. But, out of all of these users, many might have already been sent the
 * automessage before. In this step we are filtering out those users, to avoid
 * sending the same message to twice to an user.
 *
 * @param {array} users array of all users that match the segment filter
 * @param {string} amId automessage-id
 * @param {function} cb callback
 */

function removeUsersAlreadySent(users, amId, cb) {
  Event
    .find({
      type: 'auto',
      amId: amId.toString()
    })
    .select({
      uid: 1,
      '_id': -1
    })
    .exec(function (err, uids) {

      if (err) return cb(err);

      // extract all uids into an array
      uids = _.map(uids, function (u) {
        return u.uid.toString();
      });

      // filter out all users who have already been sent the automessage
      var newUsers = _.filter(users, function (u) {
        return !_.contains(uids, u._id.toString());
      });


      logger.trace({
        at: 'amConsumer:removeUsersAlreadySent',
        found: users.length,
        sent: uids.length,
        new: newUsers.length
      });

      cb(null, newUsers);
    });

}


function amConsumer(cb) {

  // the iron mq message id (required to delete the message from the queue)
  var queueMsgId;

  var automessage;
  var currentApp;


  async.waterfall(

    [

      function getFromQueue(cb) {

        // get one message at a time
        var opts = {
          n: 1
        };

        q()
          .get(opts, function (err, res) {

            if (err) return cb(err);

            if (!_.isObject(res) || !res.id) {
              return cb(new QueueError('EMPTY_AUTOMESSAGE_QUEUE'));
            }

            // store the queue message id
            queueMsgId = res.id;

            // the message body contains the automessage id
            if (!res.body) {
              return cb(new QueueError('AUTOMESSAGE_ID_NOT_FOUND_IN_QUEUE'));
            }

            cb(null, res.body);
          });
      },


      function findAutoMessage(autoMessageId, cb) {

        AutoMessage
          .findById(autoMessageId)
          .populate('sender')
          .exec(function (err, amsg) {

            if (err) return cb(err);
            if (!amsg) return cb(new QueueError('AUTOMESSAGE_NOT_FOUND'));

            // store automessage in a local variable
            automessage = amsg;

            cb();
          });
      },


      function findApp(cb) {

        App
          .findById(automessage.aid)
          .exec(function (err, app) {
            if (err) return cb(err);
            if (!app) return cb(new Error('APP_NOT_FOUND'));
            currentApp = app;
            cb();
          });

      },


      function findSegment(cb) {

        Segment
          .findById(automessage.sid)
          .exec(function (err, seg) {
            if (err) return cb(err);
            if (!seg) return cb(new QueueError('SEGMENT_NOT_FOUND'));
            cb(null, seg);
          });
      },


      function runQuery(segment, cb) {

        // segment object should be converted from BSON to JSON
        segment = segment.toJSON();

        var qObj = {
          list: segment.list,
          op: segment.op,
          filters: segment.filters
        };

        var query;

        try {
          query = new Query(segment.aid, qObj);
        } catch (err) {
          return cb(err);
        }

        query.run(function (err, users) {
          cb(err, users);
        });

      },


      // NOTE: if type is email, send the emails
      // else if type is notification, create notifications to be shown later
      //
      //
      // This can be achieved by creating a new type of event in the Event
      // collection which will identify the user and automessage alongwith the
      // action (sent, seen, clicked, replied)


      // Need to store which users are being sent the mails / notifications
      // in order to prevent double-sending mails etc.
      //
      // Remove all users who have been sent the automessage before
      function sentUsers(users, cb) {

        removeUsersAlreadySent(users, automessage._id, function (err, usrs) {
          if (err) return cb(err);
          if (_.isEmpty(usrs)) return cb(new QueueError('NO_USERS_MATCHED'));
          cb(null, usrs);
        });
      },


      function createAndSendAutomessage(users, cb) {

        async.each(

          users,

          function iterator(u, cb) {
            sendAutomessage(currentApp, automessage, automessage.sender, u, cb);
          },

          cb

        );

      },

    ],

    function callback(err) {


      var finalCallback = function (err) {
        return cb(err, queueMsgId, automessage);
      };


      // function to delete message from queue
      var deleteFromQueue = function (cb) {

        q()
          .del(queueMsgId, function (err, body) {
            cb(err);
          });
      };


      if (err) {

        // in case of not defined / unknown errors, log error and donot delete
        // from queue
        if (err.name !== 'QueueError') return finalCallback(err);


        // was the queue empty, then we would retry fetching messages from the
        // queue after some time with a setTimeout
        // if empty queue error move on, and try to fetch msg again after sometime
        if (err.message === 'EMPTY_AUTOMESSAGE_QUEUE') {
          return finalCallback(err);
        }


        // if any other QueueError, log queue error, delete message from queue

        logger.crit({
          at: 'amConsumer:QueueError',
          err: err ? JSON.stringify(err) : ''
        });

      }

      return deleteFromQueue(finalCallback);

    }
  );
}


module.exports = function run() {

  async.forever(

    function foreverFunc(next) {


      logger.trace({
        at: 'amConsumer:start'
      });

      amConsumer(function (err) {

        var logObj = {
          at: 'amConsumer:Completed',
          err: err ? JSON.stringify(err) : '',
          time: Date.now()
        };

        err ? logger.crit(logObj) : logger.trace(logObj);

        // if error is empty queue, then wait for a minute before running the
        // worker again
        if (err && err.message === 'EMPTY_AUTOMESSAGE_QUEUE') {

          setTimeout(next, 300000);

        } else {

          setImmediate(next);
        }

      });
    },

    function foreverCallback(err) {

      logger.fatal({
        at: 'amConsumer:foreverCallback',
        err: err
      });

    }
  );

};


/**
 * Expose function for test cases
 */

module.exports._amConsumer = amConsumer;
module.exports._queue = q;
module.exports._removeUsersAlreadySent = removeUsersAlreadySent;
