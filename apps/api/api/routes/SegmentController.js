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

var Segment = require('../models/Segment');


/**
 * Policies
 */

var hasAccess = require('../policies/hasAccess');
var isAuthenticated = require('../policies/isAuthenticated');


/**
 * Helpers
 */

var logger = require('../../helpers/logger');


/**
 * Lib
 */

var sanitize = require('../lib/query')
  .sanitize;


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
 * GET /apps/:aid/segments
 *
 * Returns all segments for the app
 */

router
  .route('/:aid/segments')
  .get(function (req, res, next) {

    var aid = req.app._id;

    Segment
      .find({
        aid: aid
      })
      .exec(function (err, segments) {
        if (err) return next(err);
        res
          .status(200)
          .json(segments);
      });

  });


/**
 * GET /apps/:aid/segments/:tid
 *
 * Returns a segment
 */

router
  .route('/:aid/segments/:sid')
  .get(function (req, res, next) {

    var aid = req.app._id;
    var sid = req.params.sid;

    Segment
      .findById(sid)
      .exec(function (err, segment) {
        if (err) return next(err);
        res
          .status(200)
          .json(segment);
      })


  });


/**
 * POST /apps/:aid/segments
 *
 * Creates a new segment
 */

router
  .route('/:aid/segments')
  .post(function (req, res, next) {

    logger.debug('creating new segment');

    var newSegment = req.body;
    var accid = req.user._id;
    var aid = req.app._id;

    newSegment.aid = aid;

    // add current logged in account as the creator of the segment
    newSegment.creator = accid;

    // sanitize the segment object
    newSegment = sanitize(newSegment);

    Segment
      .create(newSegment, function (err, savedSegment) {
        if (err) return next(err);
        res
          .status(201)
          .json(savedSegment);
      });

  });


module.exports = router;
