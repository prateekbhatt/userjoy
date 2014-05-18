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

var App = require('../models/App');
var Invite = require('../models/Invite');


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
 * GET /apps
 *
 * Returns all apps belonging to logged in account
 */

router
  .route('/')
  .get(function (req, res, next) {

    var accountId = req.user._id;

    App
      .findByAccountId(accountId, function (err, app) {

        if (err) {
          return next(err);
        }

        if (!app) {
          return res.notFound();
        }

        res.json(app);

      });

  });



/**
 * POST /apps
 *
 * Create a new app belonging to logged in account
 */

router
  .route('/')
  .post(function (req, res, next) {

    var newApp = req.body;


    // add admin to newApp
    newApp.team = [];
    newApp.team.push({
      accid: req.user._id,
      admin: true
    });


    App
      .create(newApp, function (err, app) {

        if (err) {
          return next(err);
        }

        res.json(app, 201);
      });

  });



/**
 * GET /apps/:aid
 *
 * Return app if it belongs to current logged in user
 */

router
  .route('/:aid')
  .get(function (req, res, next) {
    res.json(req.app);
  });


/**
 * PUT /apps/:aid/name
 *
 * Update the name of the app
 */

router
  .route('/:aid/name')
  .put(function (req, res, next) {

    req.app.name = req.body.name;
    req.app.save(function (err, app) {

      if (err) {
        return next(err);
      }

      if (!app) {
        return next(new Error('Error in PUT /apps/:aid/name'));
      }

      res.json(app);

    })
  });


// TODO:
// add routes to:
// 1. invite a new email to team member
// 2. confirm invitation:
//  - check if account already exists
//    - if exists, add to team members
//    - else create account, and then add to team members
// 3. switch team members from among admin


/**
 * POST /apps/:aid/invite
 *
 * Sends invite to add a new team member
 */

router
  .route('/:aid/invite')
  .post(function (req, res, next) {

    /**
     * Apps Config
     */

    var config = require('../../../config')('api');

    var aid = req.params.aid;
    var email = req.body.email;
    var name = req.body.name;
    var uid = req.user._id;


    async.waterfall(

      [

        function createInvite(cb) {

          var newInvite = {
            aid: aid,
            from: uid,
            toEmail: email,
            toName: name
          };

          Invite.create(newInvite, cb);
        },


        function sendInviteEmail(invite, cb) {

          var inviteId = invite._id.toString();

          var inviteUrl = path.join(config.baseUrl, 'apps', aid, 'invite',
            inviteId);

          var mailOptions = {
            locals: {
              inviteUrl: inviteUrl,
              userName: invite.toName,
              appName: req.app.name
            },
            toEmail: invite.toEmail,
            toName: invite.toName
          };

          mailer.sendInvite(mailOptions, function (err) {
            cb(err, invite);
          });
        }

      ],


      function callback(err, invite) {
        if (err) return next(err);

        res
          .status(201)
          .json(invite);

      }
    );
  });



module.exports = router;
