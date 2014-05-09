/**
 * npm dependencies
 */

var async = require('async');
var qs = require('qs');
var router = require('express')
  .Router();


/**
 * Models
 */

var Event = require('../models/Event');
var User = require('../models/User');


/**
 * Policies
 */

var hasAccess = require('../policies/hasAccess');
var isAuthenticated = require('../policies/isAuthenticated');


/**
 * Lib
 */

var Query = require('../lib/query');


/**
 * All routes on /apps/:aid/query
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
 * GET /apps/:aid/query/?queryObj
 *
 * NOTE: The queryObj should have been stringified using:
 * github:visionmedia/node-querystring
 *
 * This route takes the query obj as input and returns an array of users
 * matching the query
 */

router
  .route('/:aid/query')
  .get(function (req, res, next) {

    var q = req.query;
    var aid = req.params.aid;
    var query = new Query(aid, q);

    query.run(function (err, users) {
      if (err) return next(err);
      res
        .status(200)
        .json(users);
    });

  });


/**
 * GET /apps/:aid/query/attributes
 *
 * Returns a list of all user event-names and attributes, on which the segment
 * queries can be run
 */

router
  .route('/:aid/query/attributes')
  .get(function (req, res, next) {

    var aid = req.params.aid;
    var userAttributes = ['user_id', 'email'];

    async.waterfall(
      [

        function getEventNames(cb) {
          Event
            .distinct('name')
            .exec(function (err, eventNames) {
              cb(err, eventNames);
            });
        }

      ],

      function (err, eventNames) {
        if (err) return next(err);

        var attributes = {
          userAttributes: userAttributes,
          eventNames: eventNames
        };

        res
          .status(200)
          .json(attributes);
      }
    );

  });

module.exports = router;
