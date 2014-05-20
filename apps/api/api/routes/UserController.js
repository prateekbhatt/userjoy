/**
 * Module dependencies
 */

var router = require('express')
  .Router();


/**
 * Models
 */

var User = require('../models/User');


/**
 * Policies
 */

var isAuthenticated = require('../policies/isAuthenticated');
var hasAccess = require('../policies/hasAccess');


/**
 * Helpers
 */

var logger = require('../../helpers/logger');


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
 * GET /apps/:aid/users/:uid
 *
 * Returns user profile
 */

router
  .route('/:aid/users/:uid')
  .get(function (req, res, next) {

    logger.trace({
      at: 'UserController:getUser',
      params: req.params
    });

    User
      .findOne({
        _id: req.params.uid,
        aid: req.params.aid
      })
      .exec(function (err, user) {

        if (err) return next(err);
        if (!user) return res.notFound();

        res
          .status(200)
          .json(user);

      });

  });


module.exports = router;
