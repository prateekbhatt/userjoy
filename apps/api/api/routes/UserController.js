/**
 * Module dependencies
 */

var _ = require('lodash');
var moment = require('moment');
var router = require('express')
  .Router();


/**
 * Models
 */

var Conversation = require('../models/Conversation');
var DailyReport = require('../models/DailyReport');
var Event = require('../models/Event');
var User = require('../models/User');


/**
 * Policies
 */

var isAuthenticated = require('../policies/isAuthenticated');
var hasAccess = require('../policies/hasAccess');


/**
 * Helpers
 */

var logger = require('../../helpers/logger');
var metadata = require('../../helpers/metadata');


/**
 * Checks if a given timestamp is valid
 */

function validTimestamp(timestamp) {
  var valid = (new Date(timestamp))
    .getTime() > 0;
  return valid;
}


/**
 * All routes below need to be authenticated
 */

router.use(isAuthenticated);


/**
 * For all routes with the ':aid'
 * param, we need to check if the
 * logged in user has access to the app
 *
 * The 'hasAccess' policy also attaches the
 * app object to the request object
 * e.g. req.app
 */

router.param('aid', hasAccess);


/**
 * GET /apps/:aid/users/:uid
 *
 * Returns user profile
 */

router
  .route('/:aid/users/:uid')
  .get(function (req, res, next) {

    logger.trace({
      at: 'UserController:getUser',
      params: req.params
    });

    User
      .findOne({
        _id: req.params.uid,
        aid: req.params.aid
      })
      .exec(function (err, user) {

        if (err) return next(err);
        if (!user) return res.notFound();

        res
          .status(200)
          .json(user);

      });

  });


/**
 * GET /apps/:aid/users/:uid/conversations
 *
 * Returns 10 latest conversations of the user
 */

router
  .route('/:aid/users/:uid/conversations')
  .get(function (req, res, next) {

    logger.trace({
      at: 'UserController:getMessages',
      params: req.params
    });

    Conversation
      .find({
        uid: req.params.uid,
        aid: req.params.aid
      })
      .sort({
        ct: -1
      })
      .limit(10)
      .lean()
      .exec(function (err, conversations) {

        if (err) return next(err);

        res
          .status(200)
          .json(conversations);

      });

  });


/**
 * GET /apps/:aid/users/:uid/events
 *
 * @query {date} date unix-timestamp
 *
 * Returns events of the user in that day
 *
 * If date query param is not provided, then returns all events in the
 * present day
 */

router
  .route('/:aid/users/:uid/events')
  .get(function (req, res, next) {

    // last seven days
    var today = moment()
      .unix();


    // default date is today
    var date = parseInt(req.query.date, 10);
    date = validTimestamp(date * 1000) ? date : today;

    // from start of date to end of date
    var from = moment.utc(date * 1000)
      .startOf('day')
      .format();

    var to = moment.utc(date * 1000)
      .endOf('day')
      .format();


    logger.trace({
      at: 'UserController:getEvents',
      params: req.params,
      query: req.query,
      date: date,
      from: from,
      to: to
    });


    Event
      .find({
        uid: req.params.uid,
        aid: req.params.aid,
        ct: {
          $gt: from,
          $lt: to
        }
      })
      .sort({
        ct: -1
      })
      .exec(function (err, events) {

        if (err) return next(err);


        // NOTE: not using the code below now because the events are being sent
        // only for a day. Will think about metadata later
        // 1. convert metadata array to object
        // 2. groupBy date unix timestamp
        // var newEvents = _.chain(events)
        //   .map(function (e) {
        //     e = e.toJSON();
        //     e.meta = metadata.toObject(e.meta);
        //     return e;
        //   })
        //   .groupBy(function (e) {
        //     var startOfDay = moment(e.ct)
        //       .startOf('day')
        //       .unix();

        //     return startOfDay;
        //   })
        //   .value();

        res
          .status(200)
          .json(events);

      });

  });


/**
 * GET /apps/:aid/users/:uid/scores
 *
 * @query {date} from from-unix-timestamp
 * @query {date} to to-unix-timestamp
 *
 * Returns engagement scores, from from-timestamp to to-timestamp
 *
 * If from and to query params are not provided, then returns scores of the last
 * 28 days
 */

router
  .route('/:aid/users/:uid/scores')
  .get(function (req, res, next) {

    var aid = req.params.aid;
    var uid = req.params.uid;
    var cid;

    var thirtyDaysAgo = moment()
      .subtract('days', 28)
      .unix();

    var from = parseInt(req.query.from, 10);
    var to = parseInt(req.query.to, 10);

    // NOTE: multiplying by 1000 to convert from unix timestamp in seconds
    // to milliseconds
    thirtyDaysAgo = thirtyDaysAgo * 1000;
    from = from * 1000;
    to = to * 1000;

    // default from timestamp is thirtyDaysAgo
    from = validTimestamp(from) ? from : thirtyDaysAgo;

    // default to timestamp is now
    to = validTimestamp(to) ? to : Date.now();


    logger.trace({
      at: 'UserController:getScores',
      params: req.params,
      query: req.query,
      valid: validTimestamp(from),
      from: from,
      to: to
    });


    DailyReport
      .get('score', aid, uid, cid, from, to, function (err, scores) {

        if (err) return next(err);

        res
          .status(200)
          .json(scores);

      });

  });


module.exports = router;
