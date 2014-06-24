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

var accountMailer = require('../services/account-mailer');


/**
 * Helpers
 */

var logger = require('../../helpers/logger');


/**
 * GET /apps/:aid/invites/:inviteId
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
  .route('/:appId/invites/:inviteId')
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
          App.addMember(aid, account._id, function (err, app) {

            // if 'is team member' error, delete invite and send response

            if (err && (err.message === 'Is Team Member')) {

              Invite.findByIdAndRemove(inviteObj._id, function (removeErr) {
                removeErr = removeErr || err;
                cb(removeErr, app);
              });

            } else {

              cb(err, app);
            }

          });
        },


        function deleteInviteToken(app, cb) {
          Invite.findByIdAndRemove(inviteObj._id, function (err) {
            cb(err, app);
          });
        }

      ],


      function callback(err, app) {

        logger.trace({
          at: 'invite:confirm',
          inviteObj: inviteObj
        });

        if (err) {

          if (err.message === 'Create Account') {
            return res.status(200)
              .json({
                success: false,
                name: inviteObj.toName,
                message: 'REDIRECT_TO_SIGNUP',
                email: inviteObj.toEmail
              });
          }

          if (err.message === 'Is Team Member') {
            return res.status(200)
              .json({
                success: false,
                name: inviteObj.toName,
                message: 'IS_TEAM_MEMBER',
                email: inviteObj.toEmail
              });
          }


          if (err.message === 'Invite not found') {
            return res.status(404)
              .json({
                success: false,
                message: 'INVITE_NOT_FOUND',
              });
          }

          return next(err);
        }

        res
          .status(200)
          .json({
            success: true,
            message: 'REDIRECT_TO_LOGIN',
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


// TODO:
// add routes to:
// 1. invite a new email to team member
// 2. confirm invitation:
//  - check if account already exists
//    - if exists, add to team members
//    - else create account, and then add to team members
// 3. switch team members from among admin


/**
 * POST /apps/:aid/invites
 *
 * Sends invite to add a new team member
 */

router
  .route('/:aid/invites')
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

          var inviteUrl = path.join(config.hosts.dashboard, 'apps', aid,
            'invite',
            inviteId);

          var mailOptions = {
            locals: {
              inviteUrl: inviteUrl,
              name: invite.toName,
              appName: req.app.name
            },
            to: {
              email: invite.toEmail,
              name: invite.toName
            }
          };

          accountMailer.sendInvite(mailOptions, function (err) {

            console.log('\n\n\n sending invite', err, invite);
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



/**
 * GET /apps/:aid/invites
 *
 * Gets all pending invites
 */

router
  .route('/:aid/invites')
  .get(function (req, res, next) {

    Invite
      .find({
        aid: req.params.aid
      })
      .exec(function (err, invites) {
        if (err) return next(err);
        res
          .status(200)
          .json(invites);
      });

  });


module.exports = router;
