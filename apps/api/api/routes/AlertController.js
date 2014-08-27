/**
 * npm dependencies
 */

var _ = require('lodash');
var async = require('async');
var router = require('express')
  .Router();


/**
 * Models
 */

var Alert = require('../models/Alert');
var Conversation = require('../models/Conversation');
var Segment = require('../models/Segment');
var User = require('../models/User');


/**
 * Policies
 */

var hasAccess = require('../policies/hasAccess');
var isAuthenticated = require('../policies/isAuthenticated');


/**
 * Helpers
 */

var appEmail = require('../../helpers/app-email');
var logger = require('../../helpers/logger');


/**
 * Worker queue
 */

var amQueue = require('../../workers/queues')
  .alert;


/**
 * Transforms an alerts obj into expected JSON format
 *
 * @param {object/array} alerts array/single-object of alerts from the db
 * @return {object/array} final-output
 */

function transformAlertsObj(alerts) {


  var transform = function (al) {

    // convert to JSON from BSON
    if (al.toJSON) al = al.toJSON();

    // rename sid object to segment obj
    al.segment = al.sid;
    delete al.sid;

    return al;
  };

  var output;


  if (_.isArray(alerts)) {


    // if an array of alerts
    output = _.map(alerts, function (alert) {
      return transform(alert);
    });


  } else {

    // if a single alert object
    output = transform(alerts);
  }

  return output;

}


/**
 * All routes on /apps
 * need to be authenticated
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
 * GET /apps/:aid/alerts
 *
 * Returns all alerts for the app
 */

router
  .route('/:aid/alerts')
  .get(function (req, res, next) {

    var aid = req.app._id;

    Alert
      .find({
        aid: aid
      })
      .populate({
        path: 'sid',
        select: 'name'
      })
      .exec(function (err, alerts) {
        if (err) return next(err);

        var finalOutput = transformAlertsObj(alerts);

        res
          .status(200)
          .json({
            alerts: finalOutput
          });
      });

  });


/**
 * GET /apps/:aid/alerts/:alertId
 *
 * Returns a alert
 */

router
  .route('/:aid/alerts/:alertId')
  .get(function (req, res, next) {

    var aid = req.app._id;
    var alertId = req.params.alertId;
    var team = req.app.team;

    async.waterfall(

      [


        function findAlert(cb) {

          Alert
            .findById(alertId)
            .populate({
              path: 'sid',
              select: 'name _id'
            })
            .exec(cb);

        },

        function getApp(alert, cb) {

          var populate = {
            path: 'team.accid',
            select: 'name email'
          };

          req.app.populate(populate, function (err, app) {
            cb(err, alert, app);
          });

        },

        function populateTeam(alert, app, cb) {

          if (alert.toJSON) alert = alert.toJSON();
          if (app.toJSON) app = app.toJSON();

          var allMembers = [];
          var alertMembers = alert.team;

          _.each(app.team, function (m) {

            // accid
            var pushMember = m.accid;

            if (_.contains(alertMembers, m.accid._id.toString())) {
              pushMember.active = true;
            } else {
              pushMember.active = false;
            }

            allMembers.push(pushMember);

          });

          alert.team = allMembers;

          cb(null, alert);
        }

      ],

      function callback(err, alert) {

        if (err) return next(err);

        var finalOutput = transformAlertsObj(alert);

        res
          .status(200)
          .json({
            alert: finalOutput
          });
      }
    )



  });


/**
 * POST /apps/:aid/alerts
 *
 * Creates a new alert
 */

router
  .route('/:aid/alerts')
  .post(function (req, res, next) {

    logger.debug('creating new alert');

    var newAlert = req.body;

    newAlert.aid = req.params.aid;

    Alert
      .create(newAlert, function (err, savedAlert) {
        if (err) return next(err);

        Segment
          .findById(savedAlert.sid)
          .select('_id name')
          .exec(function (err, segment) {

            if (err) return next(err);

            savedAlert = savedAlert.toJSON();

            savedAlert.sid = segment;
            var finalOutput = transformAlertsObj(savedAlert);

            res
              .status(201)
              .json({
                alert: finalOutput
              });

          })

      });

  });


/**
 * PUT /apps/:aid/alerts/:alertId/active/:status
 *
 * status should be either true or false
 *
 * Updates active status of alert.
 */

router
  .route('/:aid/alerts/:alertId/active/:status?')
  .put(function (req, res, next) {


    logger.trace({
      at: 'alert:updateStatus',
      params: req.params
    });


    var aid = req.params.aid;
    var alertId = req.params.alertId;
    var status = req.params.status;

    if (!_.contains(['true', 'false'], status)) {
      return res.badRequest(
        'Active status should be either true or false');
    }


    async.waterfall(
      [

        function findAlert(cb) {
          Alert.findOne({
            _id: alertId,
            aid: aid
          }, function (err, alert) {
            if (err) return cb(err);
            if (!alert) return cb(new Error('Alert not found'));
            cb(null, alert);
          });
        },

        function updateActiveStatus(alert, cb) {
          alert.active = status;
          alert.save(function (err, savedAlert) {
            cb(err, savedAlert);
          });
        }
      ],

      function (err, alert) {
        if (err) {
          if (err.message === 'Alert not found') {
            return res.notFound(err.message);
          }
          return next(err);
        }

        res
          .status(200)
          .json({
            alert: alert
          });
      }
    );

  });


module.exports = router;
