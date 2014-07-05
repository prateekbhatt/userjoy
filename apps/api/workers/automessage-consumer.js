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

var AutoMessage = require('../api/models/AutoMessage');
var Event = require('../api/models/Event');
var Notification = require('../api/models/Notification');
var Segment = require('../api/models/Segment');


/**
 * Services
 */

var userMailer = require('../api/services/user-mailer');


/**
 * Helpers
 */

var appEmail = require('../helpers/app-email');
var getRenderData = require('../helpers/get-render-data');
var logger = require('../helpers/logger');
var QueueError = require('../helpers/queue-error');
var render = require('../helpers/render-message');


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


function saveNotifications(users, amsg, cb) {

  var aid = amsg.aid;
  var amId = amsg._id;
  var body = amsg.body;
  var senderEmail = amsg.sender.email;
  var senderName = amsg.sender.name;
  var title = amsg.title;

  var iterator = function (u, cb) {

    var uid = u._id;

    // get locals (user metadata, emails, user_id) for rendering the message body
    var renderLocals = getRenderData(u);

    // render the body of the automessage before saving it as a notification
    var renderedBody = render.string(body, renderLocals);

    var n = {
      amId: amId,
      body: renderedBody,
      senderEmail: senderEmail,
      senderName: senderName,
      title: title,
      uid: uid
    };

    // save the new notification
    Notification.create(n, function (err) {
      if (err) return cb(err);

      // ids object (required to create an 'automessage' event)
      var ids = {
        aid: aid,
        amId: amId,
        uid: uid
      };

      // create 'automessage' event
      // NOTE: unlike emails, notifications should have a 'sent' event
      createEventAndIncrementCount(ids, 'sent', title, cb);

    });

  };

  async.each(users, iterator, cb);
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

            cb(null, automessage);
          });
      },


      function findSegment(automessage, cb) {

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


      function sendEmails(users, cb) {

        // if message type is not email, skip this
        if (automessage.type !== "email") return cb(null, users);

        async.each(

          users,

          function iterator(u, cb) {

            // locals to render body and subject
            var locals = {
              user: u
            };

            // render body and subject in BEFORE calling mailer service
            var body = render.string(automessage.body, locals);
            var subject = render.string(automessage.sub, locals);

            var fromEmail = appEmail(automessage.aid);
            var fromName = automessage.sender.name;

            var options = {
              locals: {
                body: body
              },
              from: {
                email: fromEmail,
                name: fromName
              },
              metadata: {
                'uj_aid': automessage.aid,
                'uj_title': automessage.title,
                'uj_mid': automessage._id,
                'uj_uid': u._id,
                'uj_type': 'auto',
              },
              replyTo: {
                email: appEmail.reply.create({
                  aid: automessage.aid,
                  type: 'auto',
                  messageId: automessage._id
                }),
                name: 'Reply to ' + fromName
              },
              subject: subject,
              to: {
                email: u.email,
                name: u.name
              },
            };


            userMailer.sendAutoMessage(options, function (err) {
              if (err) return cb(err);

              var ids = {
                aid: automessage.aid,
                amId: automessage._id,
                uid: u._id
              };

              var state = 'queued';
              var title = automessage.title;

              Event.automessage(ids, state, title, function (err, evn) {
                cb(err, evn);
              });

            });
          },

          function callback(err) {
            cb(err, users);
          });
      },


      function sendNotifications(users, cb) {

        // if message type is not notification, skip this
        if (automessage.type !== "notification") return cb();

        saveNotifications(users, automessage, cb);

      }
    ],

    function finalCallback(err) {


      // function to delete message from queue
      var deleteFromQueue = function (cb) {

        q()
          .del(queueMsgId, function (err, body) {
            cb(err);
          });
      };


      if (err && (err.name === 'QueryError')) {

        // was the queue empty, then we would retry fetching messages from the
        // queue after some time with a setTimeout
        // if empty queue error move on, and try to fetch msg again after sometime
        if (err.message === 'EMPTY_AUTOMESSAGE_QUEUE') {
          return cb(err);
        }


        // if any other QueueError, log queue error, delete message from queue

        logger.crit({
          at: 'amConsumer:QueueError',
          err: err
        });

        return deleteFromQueue(function (err) {
          cb(err, queueMsgId, automessage);
        });

      }

      // in case of not defined / unknown errors, log error and donot delete
      // from queue
      return cb(err);

    }
  );
}


module.exports = function run() {

  async.forever(

    function foreverFunc(next) {


      console.log('\n\n\n');
      logger.trace({
        at: 'amConsumer:start'
      });

      amConsumer(function (err) {

        var logObj = {
          at: 'amConsumer:Completed',
          err: err,
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
