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

var Account = require('../models/Account');
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
 * Helpers
 */

var logger = require('../../helpers/logger');


/**
 * GET /apps/:aid/invite/:inviteId
 *
 * Confirm invitation on clicking the link in the Invite email:
 * - check if account already exists
 * - if exists, add to team members
 * - else the user should be redirected to the signup page
 *
 * ALERT:
 *
 * 1. This route does not need authentication. Hence it is above the
 * isAuthenticated and hasAccess policies.
 * 2. The param to accept the application-id is 'appId' and not 'aid'. This is
 * because router.param('aid', hasAccess) always invokes the hasAccess
 * middleware, even though the route is defined above.
 *
 */

router
  .route('/:appId/invite/:inviteId')
  .get(function (req, res, next) {

    var aid = req.params.appId;
    var inviteId = req.params.inviteId;
    var inviteObj;

    async.waterfall(

      [

        function checkInvite(cb) {

          Invite
            .findOne({
              _id: inviteId,
              aid: aid
            })
            .exec(function (err, invite) {
              if (err) return cb(err);
              if (!invite) return cb(new Error('Invite not found'));
              inviteObj = invite;
              cb(null, invite);
            });

        },


        function checkAccount(invite, cb) {

          Account
            .findOne({
              email: invite.toEmail
            })
            .exec(function (err, acc) {
              if (err) return cb(err);
              if (!acc) return cb(new Error('Create Account'));
              cb(null, acc);
            })

        },

        function addToTeam(account, cb) {
          App.addMember(aid, account._id, cb);
        }

      ],


      function callback(err, app) {

        logger.trace({
          at: 'invite:confirm',
          inviteObj: inviteObj
        });

        if (err) {

          if (err.message === 'Create Account') {
            return res.status(200).json({
              success: false,
              name: inviteObj.toName,
              message: 'Redirect to signup',
              email: inviteObj.toEmail
            });
          }

          return next(err);
        }

        res
          .status(200)
          .json({
            success: true,
            message: 'Redirect to login',
            email: inviteObj.toEmail
          });

      }
    );
  });


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

          var inviteUrl = path.join(config.hosts.dashboard, 'apps', aid, 'invite',
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
