/**
 * Module dependencies
 */

var router = require('express')
  .Router(),
  async = require('async');


/**
 * Models
 */

var User = require('../models/User');






/**
 * GET /track
 *
 *
 * =======================
 * PSEUDOCODE
 * =======================
 *
 * =======================
 * Input
 * =======================
 *
 *  session
 *  user
 *  company (optional)
 *  event
 *
 * =======================
 * Authenticate
 * =======================
 *
 * fetch app with apikey = dodatado id
 * check if domain == request domain
 * else return
 *
 *
 * =======================
 * Create Event
 * =======================
 *
 * if no user input or no session input
 *   return
 *
 * if no session id
 *   create session
 * else
 *   fetch session
 *   if not valid session (userId, appId)
 *     create new session
 *
 * create event
 *
 * send session id cookie
 *
 * =======================
 * Create Session
 * =======================
 *
 * if no user input
 *   return
 *
 * if company input
 *   fetch company
 *   if company does not exist
 *     create company
 *
 * fetch user
 * if no user
 *   create user
 *
 * create session
 *
 */

router
  .route('/')
  .get(function (req, res, next) {


    var data = req.query;
    var appId = data.app_id;
    var user = data.user;
    var email, user_id;

    if (!appId) {
      return res.badRequest('Please send app_id with the params');
    }

    if (!user) {
      return res.badRequest('Please send user_id or email to identify user');
    }

    user = JSON.parse(user);

    if (!(user.email || user.user_id)) {
      return res.badRequest('Please send user_id or email to identify user');
    }


    async.waterfall([

        function (cb) {
          User.getOrCreate(appId, user, function (err, usr) {
            cb(err, usr);
          });
        }

      ],

      function (err, results) {
        // console.log('/track callback', arguments);

        if (err) return next(err);
        res.json();

      });

  });


module.exports = router;
