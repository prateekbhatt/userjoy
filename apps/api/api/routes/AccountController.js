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
        return next(err);
      }

      res.json(accounts);

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
        return res.notFound();
      }

      res.json(acc);

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

        if (_.contains(['Invalid Token', 'Account Not Found'], err.message)) {
          return res.unauthorized('Invalid Attempt');
        }

        return next(err);
      }

      res.json(account);

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

    res.json(account);

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
