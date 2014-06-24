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

var accountMailer = require('../services/account-mailer');


/**
 * Helpers
 */

var logger = require('../../helpers/logger');


function signupWithInvite(account, inviteId, cb) {

  async.waterfall(

    [

      function findInvite(cb) {

        Invite
          .findById(inviteId)
          .exec(function (err, invite) {
            if (err) return cb(err);
            if (!invite) return cb(new Error('Invite not found'));
            cb(null, invite);
          });
      },

      function createAccount(invite, cb) {

        // set emailVerified as true
        account.emailVerified = true;

        Account.create(account, function (err, acc) {
          cb(err, acc, invite);
        });
      },

      function addMember(acc, invite, cb) {

        // add as a team member to the app the user was invited to
        App.addMember(invite.aid, acc._id, function (err, app) {
          cb(err, acc, invite);
        });
      },

      function deleteInvite(acc, invite, cb) {
        // delete invite
        Invite.findByIdAndRemove(invite._id, function (err) {
          cb(err, acc);
        });

      }
    ],

    cb
  );
}


function signupWithoutInvite(account, cb) {

  /**
   * Apps config
   */

  var config = require('../../../config')('api');
  var dashboardUrl = config.hosts.dashboard;

  async.waterfall(

    [

      function createAccount(cb) {
        account.emailVerified = false;
        Account.create(account, cb);
      },

      function createVerifyToken(acc, cb) {
        acc.createVerifyToken(function (err, acc, verifyToken) {
          cb(err, acc, verifyToken);
        });
      },

      function sendConfirmationMail(acc, verifyToken, cb) {

        var confirmUrl = dashboardUrl + '/account/' + acc._id.toString() +
          '/verify-email/' + verifyToken;

        var mailOptions = {
          locals: {
            confirmUrl: confirmUrl,
            name: acc.name
          },
          to: {
            email: acc.email,
            name: acc.name
          }
        };

        accountMailer.sendConfirmation(mailOptions, function (err) {
          cb(err, acc);
        });

      },

    ],

    cb

  );
}



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

    var account = req.body;
    var inviteId = req.body.inviteId;

    var respond = function (err, acc) {
      if (err) return next(err);
      res
        .status(201)
        .json(acc);
    }

    if (!inviteId) return signupWithoutInvite(account, respond);

    signupWithInvite(account, inviteId, function (err, acc) {

      if (err && err.message === 'Invite not found') {
        return signupWithoutInvite(account, respond);
      }

      respond(err, acc);
    });

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

    var accountId = req.params.id;
    var token = req.params.token;

    Account
      .verify(accountId, token, function (err, account) {

        if (err) {

          if (_.contains(['Invalid Token', 'Account Not Found'], err.message)) {
            return res.badRequest('Invalid Attempt');
          }

          return next(err);
        }

        res.json(account);

      });

  });


/**
 * PUT /account/forgot-password/new
 *
 *
 * @param {string} token reset-password-token
 * @param {string} password new-password
 *
 * Verfies reset password token and updates password
 *
 * TODO: Make this more secure by prepending the account id to the token
 */

router
  .route('/forgot-password/new')
  .put(function (req, res, next) {

    var token = req.body.token;
    var newPass = req.body.password;

    if (!token || !newPass) {
      return res.badRequest('Please provide token and new password');
    }

    logger.trace({
      at: 'AccountController forgot-password/new',
      body: req.body
    })

    async.waterfall([

        function verify(cb) {

          Account
            .findOne({
              passwordResetToken: token,
            })
            .exec(function (err, account) {
              if (err) return cb(err);
              if (!account) return cb(new Error('INVALID_TOKEN'));
              cb(null, account);
            });
        },

        function updatePasswordAndRemoveToken(account, cb) {

          account.passwordResetToken = undefined;
          account.password = newPass
          account.save(cb);

        }
      ],

      function (err, account) {

        if (err) {

          if (err.message === 'INVALID_TOKEN') {
            return res.badRequest('Invalid Attempt. Please try again.');
          }

          return next(err);
        }


        // remove password from response
        if (account.toJSON) account = account.toJSON();
        delete account.password;

        res.json({
          message: 'Password token verified',
          account: account
        });

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
 * PUT /account/forgot-password
 *
 * TODO: add the respective get request
 * which will check the token and redirect
 * user to new-password page
 */

router
  .route('/forgot-password')
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



      /**
       * Apps config
       */

      var config = require('../../../config')('api');
      var dashboardUrl = config.hosts.dashboard;

      accountMailer.sendForgotPassword({
        locals: {
          url: dashboardUrl + '/forgot-password/' + account.passwordResetToken,
          name: account.name
        },

        to: {
          email: account.email,
          name: account.name
        },

      }, function (err) {

        if (err) return next(err);

        res.json({
          message: 'Reset password email sent'
        });
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
