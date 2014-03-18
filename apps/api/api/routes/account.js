/**
 * Module dependencies
 */

var router = require('express')
  .Router();

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

      res.json(acc, 201);
    });

})

module.exports = router;
