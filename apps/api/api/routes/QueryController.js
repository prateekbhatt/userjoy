/**
 * npm dependencies
 */

var async = require('async');
var qs = require('qs');
var router = require('express')
  .Router();


/**
 * Models
 */

var Account = require('../models/Account');


/**
 * Policies
 */

var isAuthenticated = require('../policies/isAuthenticated');


/**
 * Lib
 */

var Query = require('../lib/query');


/**
 * All routes on /query
 * need to be authenticated
 */

router.use(isAuthenticated);


/**
 * GET /query/?queryObj
 */

router
  .route('/')
  .get(function (req, res, next) {

    var q = req.query;
    var aid = q.aid;

    if (!aid) {
      return res.badRequest('Provide a valid app id');
    }

    // FIXME : check if the user has access to this app


    var query = new Query(aid, q);

    query.run(function (err, users) {

      if (err) {
        return next(err);
      }

      res.json(users);

    });

  });


module.exports = router;
