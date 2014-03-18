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
 * GET /accounts
 */

router.get('/', function (req, res, next) {

  Account
    .find()
    .exec(function (err, accounts) {

      if (err) {
        next(err);
      }

      res.json(accounts, 200);

    });

});


/**
 * GET /account/:id
 */

router.get('/:id', function (req, res, next) {

  Account
    .findById(req.params.id)
    .exec(function (err, acc) {

      if (err) {
        return next(err);
      }

      if (!acc) {
        return next(new Error(404));
      }

      res.json(acc, 200);

    });

});

/**
 * POST /accounts
 * Create a new account
 */

router.post('/', function (req, res, next) {

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
 * GET /accounts/:id/verify-email/:token
 */

router.get('/:id/verify-email/:token', function (req, res, next) {

  var accountId = req.params.id,
    token = req.params.token;

  Account
    .verify(accountId, token, function (err, account) {

      if (err) {

        if (err.message === 'Invalid Token') {

          return res.json({
            error: err.message,
            status: 403
          }, 403);

        }

        return next(err);
      }

      if (!account || !account.emailVerified) {
        return next(new Error('Email Verification Failed'));
      }

      res.json(account, 200);

    });

});


/**
 * PUT /accounts/:id
 * Update account
 */

router.put('/:id/name', function (req, res, next) {


  async.waterfall([

    function (cb) {

      Account.findById(req.params.id, cb);

    },

    function (account, cb) {

      account.name = req.body.name;
      account.save(cb);

    },

  ], function (err, account) {

    if (err) {
      return next(err);
    }

    res.json(account, 200);

  });

});

/**
 * PUT /accounts/:id
 * Update account
 */

router.put('/reset-password', function (req, res, next) {


  Account.createResetPasswordToken(req.body.email, function (err, account) {

    if (err) {

      if (err.message === 'Invalid Email') {

        return res.json({
          error: 'Provide a valid email',
          status: 400
        }, 400);

      }

      return next(err);
    }

    // TODO : Send reset password mail here

    res.json(account, 200);

  });

});

module.exports = router;
