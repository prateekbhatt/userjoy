/**
 * Module dependencies
 */

var async = require('async');
var path = require('path');
var router = require('express')
  .Router();


/**
 * Models
 */

var UserNote = require('../models/UserNote');


/**
 * Policies
 */

var isAuthenticated = require('../policies/isAuthenticated');
var hasAccess = require('../policies/hasAccess');


/**
 * Services
 */

var mailer = require('../services/mailer');


/**
 * Helpers
 */

var logger = require('../../helpers/logger');


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
 * GET /apps/:aid/users/:uid/notes
 *
 * Returns notes about the user
 */

router
  .route('/:aid/users/:uid/notes')
  .get(function (req, res, next) {

    var aid = req.params.appId;
    var usernoteId = req.params.usernoteId;
    var usernoteObj;

    UserNote
      .find({
        uid: req.params.uid,
        aid: req.params.aid
      })
      .sort({
        ct: -1
      })
      .exec(function (err, notes) {

        if (err) return next(err);

        res
          .status(200)
          .json(notes);

      });

  });


/**
 * POST /apps/:aid/users/:uid/notes
 *
 * Creates a note about a user
 */

router
  .route('/:aid/users/:uid/notes')
  .post(function (req, res, next) {

    UserNote
      .create({
        aid: req.params.aid,
        creator: req.user._id,
        note: req.body.note,
        uid: req.params.uid,
      }, function (err, note) {

        if (err) return next(err);

        res
          .status(201)
          .json(note);
      });
  });



/**
 * PUT /apps/:aid/users/:uid/notes/:nid
 *
 * Updates a note
 */

router
  .route('/:aid/users/:uid/notes/:nid')
  .put(function (req, res, next) {

    var updatedNote = req.body.note;

    if (!updatedNote) {
      return res.badRequest('Provide a valid note');
    }


    var conditions = {
      _id: req.params.nid,
      aid: req.params.aid,
      uid: req.params.uid
    };

    var update = {
      $set: {
        note: req.body.note,

        // ut has to be manually updated, because its an atomic update using
        // Mongo's findAndModify method
        ut: Date.now()
      }
    };

    UserNote
      .findOneAndUpdate(conditions, update, function (err, note) {
        if (err) return next(err);

        res
          .status(201)
          .json(note);
      });

  });



module.exports = router;
