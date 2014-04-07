/**
 * Module dependencies
 */

var router = require('express')
  .Router(),
  async = require('async');


/**
 * Models
 */

var Account = require('../models/Account');


/**
 * Policies
 */

var isAuthenticated = require('../policies/isAuthenticated');



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
 * Create a new account
 */

router
  .route('/')
  .post(function (req, res, next) {

    var newAccount = req.body;

    Account
      .create(newAccount, function (err, acc) {

        if (err) {
          return next(err);
        }

        // TODO : Send Verification Email Here

        res.json(acc, 201);
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

      res.json(account);

    });

  });

module.exports = router;
