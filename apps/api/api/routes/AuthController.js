/**
 * Module dependencies
 */

var router = require('express')
  .Router(),
  async = require('async'),
  passport = require('passport');


/**
 * Models
 */

var Account = require('../models/Account');


/**
 * Passport js configuration
 */

require('../services/passport');


/**
 * POST /auth/login
 */

router.post('/login', function (req, res, next) {

  passport.authenticate('local', function (err, user, info) {

    if ((err) || (!user)) {
      return res.json({
        status: 403,
        error: info && info.message ? info.message : 'Forbidden'
      }, 403);
    }

    req.login(user, function (err) {

      if (err) {
        return res.json({
          status: 403,
          error: err
        }, 403);
      }

      return res.json({
        status: 200,
        message: 'Logged In Successfully'
      }, 200);

    });

  })(req, res, next);

});

/**
 * POST /auth/logout
 * Logs out user
 */

router.post('/logout', function (req, res, next) {

  req.logout();
  res.json({
    status: 200,
    message: 'Logged Out Successfully'
  });

});

module.exports = router;
