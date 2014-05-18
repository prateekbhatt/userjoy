/**
 * Module dependencies
 */

var _ = require('lodash');
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


/**
 * Services
 */

var mailer = require('../services/mailer');


/**
 * GET /account/
 *
 * NOTE: isAuthenticated middleware is called only for
 * get /account and not post /account
 */

router
  .route('/')
  .get(isAuthenticated)
  .get(function (req, res, next) {

    if (!req.user) {
      return res.notFound();
    }

    res.json(req.user);

  });


/**
 * POST /account
 *
 * Create a new account
 *
 * Check if invited:
 * - if invited, add as team member to app
 * - else, send email confirmation mail (TODO)
 */

router
  .route('/')
  .post(function (req, res, next) {

    /**
     * Apps config
     */

    var config = require('../../../config')('api');

    var newAccount = req.body;
    var inviteId = req.body.inviteId;

    // should the email confirmation mail be sent?
    // if the account was invited, then no
    var shouldSendMail = true;

    async.waterfall(

      [

        function createAccount(cb) {
          Account.create(newAccount, cb);
        },


        function invited(acc, cb) {

          // if not invited, move on
          if (!inviteId) return cb(null, acc);

          Invite
            .findById(inviteId)
            .exec(function (err, inv) {
              if (err) return cb(err);

              // if invite not found, then move on, and send confirmation email
              // to user
              if (!inv) return cb(null, acc);

              // add as a team member to the app the user was invited to
              App.addMember(inv.aid, acc._id, function (err, app) {
                if (err) return cb(err);

                // now the email confirmation mail should not be sent
                shouldSendMail = false;

                // delete invite
                Invite.findByIdAndRemove(inv._id, function (err) {
                  cb(err, acc);
                });

              });

            });
        },

        function sendConfirmationMail(acc, cb) {
          if (!shouldSendMail) return cb(null, acc);

          acc.createVerifyToken(function (err, acc, verifyToken) {

            var confirmUrl = path.join(config.baseUrl, 'account',
              acc._id.toString(), 'verify-email', verifyToken);

            var mailOptions = {
              locals: {
                confirmUrl: confirmUrl,
                name: acc.name
              },
              toEmail: acc.email,
              toName: acc.name
            };

            // send Verification Email
            mailer.sendConfirmation(mailOptions, function (err) {
              cb(err, acc);
            });

          });

        },

      ],

      function callback(err, acc) {
        if (err) return next(err);
        res
          .status(201)
          .json(acc);
      }

    );
  });


/**
 * GET /account/:id/verify-email/:token
 *
 * TODO : Update this endpoint to /account/verify-email/:token
 * for consistency
 */

router
  .route('/:id/verify-email/:token')
  .get(function (req, res, next) {

    var accountId = req.params.id,
      token = req.params.token;

    Account
      .verify(accountId, token, function (err, account) {

        if (err) {

          if (_.contains(['Invalid Token', 'Account Not Found'], err.message)) {
            return res.unauthorized('Invalid Attempt');
          }

          return next(err);
        }

        res.json(account);

      });

  });


/**
 * PUT /account/name
 * Update account name
 */

router
  .route('/name')
  .put(isAuthenticated)
  .put(function (req, res, next) {

    req.user.name = req.body.name;
    req.user.save(function (err, account) {

      if (err) {
        return next(err);
      }

      res.json(account);

    });

  });


/**
 * PUT /account/reset-password
 *
 * TODO: add the respective get request
 * which will check the token and redirect
 * user to new-password page
 */

router
  .route('/reset-password')
  .put(function (req, res, next) {

    Account.createResetPasswordToken(req.body.email, function (err, account) {

      if (err) {

        if (err.message === 'Invalid Email') {
          return res.badRequest('Provide a valid email');
        }

        if (err.message === 'Account Not Found') {
          return res.notFound('Provide a valid email');
        }

        return next(err);
      }

      // TODO : Send reset password mail here

      res.json({
        message: 'Reset password email sent'
      });

    });

  });


/**
 * PUT /account/password/update
 * Update account password
 */

router
  .route('/password/update')
  .put(isAuthenticated)
  .put(function (req, res, next) {

    var currPass = req.body.currentPassword;
    var newPass = req.body.newPassword;

    req.user.updatePassword(currPass, newPass, function (err) {

      if (err) {
        if (err.message === 'Incorrect Password') {
          return res.badRequest(
            'Please provide the correct current password');
        }

        return next(err);
      }

      res.json({
        message: 'Password updated'
      });
    });

  });


module.exports = router;
