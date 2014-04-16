/**
 * NPM dependencies
 */

var router = require('express')
  .Router(),
  async = require('async');


/**
 * Models
 */

var User = require('../models/User');
var App = require('../models/App');


/**
 * Lib
 */

var track = require('../lib/track');


/**
 * GET /track
 *
 *
 * =======================
 * PSEUDOCODE
 * =======================
 * NOTES:
 *
 * - create a user cookie (dodatado.uid, 2 years) for an identified user
 * - create a session cookie (dodatado.sid, 30 minutes) for an user session
 * - create a company cookie (dodatado.cid, 2 years) for an user session
 * =======================
 * Input
 * =======================
 *
 *  app
 *  session
 *  user || user cookie
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
    var appKey = data.app_id;
    var user = data.user;
    var domain = req.host;
    console.log('   /track', req.cookies);

    var mode;


    // fetch values from cookies
    var uid = req.cookies['dodatado.uid'];
    var sid = req.cookies['dodatado.sid'];
    var cid = req.cookies['dodatado.cid'];


    // Validations

    if (!appKey) {
      return res.badRequest('Please send app_id with the params');
    }

    // check if the request is in test / live mode
    mode = appKey.split('_')[0];


    // if both the user identifier and user cookie are not present, respond
    // with an error
    if (!(user || uid)) {
      return res.badRequest('Please send user_id or email to identify user');
    }

    user = JSON.parse(user);

    if (!(user.email || user.user_id)) {
      return res.badRequest('Please send user_id or email to identify user');
    }


    async.waterfall([

        function findAndVerifyApp(cb) {

          App
            .findByKey(mode, appKey, function (err, app) {
              if (err) {
                return cb(err);
              }

              if (!app) {
                return cb(new Error('App Not Found'));
              }

              // in test mode do not check if domain is matching
              // however, in live mode the request domain must match the
              // app domain

              if (mode !== 'test') {
                if (!app.checkDomain(domain)) {
                  return cb(new Error('Domain Not Matching'));
                }
              }

              cb(null, app);

            });

        },

        function checkOrCreateCompany(cb) {

          // if valid cid, move on
          // else if no valid company object, move on
          // else getOrCreate company

          if (cid) {
            return cb();
          }

          if (!company) {
            return cb();
          }

          // TODO : getOrCreate company here
          cb();

        },


        function checkOrCreateUser(app, cb) {

          // if valid uid, move on
          // else getOrCreate user

          if (uid) {
            return cb(null, uid);
          }

          User.getOrCreate(app._id, user, function (err, usr) {
            cb(err, usr._id);
          });

        },


        function checkOrCreateSession(cb) {

          // if valid session id, move on
          // else create new session

          if (sid) {
            return cb();
          }

          // TODO create new session
          cb();
        },


        function createEvent(arguments) {

        }


      ],

      function (err, results) {

        if (err) return next(err);

        var resObj = {
          userId: 'user_id',
          companyId: 'company_id',
          sessionId: 'session_id'
        };

        res.jsonp(resObj);

      });

  });


/**
 * Expose router
 */

module.exports = router;




/**
 * Finds app using key and mode
 * Authenticates domain in live mode
 *
 * @param  {string}   mode   test/live
 * @param  {string}   appKey
 * @param  {string}   domain
 * @param  {Function} cb     callback function
 */

function _findAndVerifyApp(mode, appKey, domain, cb) {

  App
    .findByKey(mode, appKey, function (err, app) {

      if (err) {
        return cb(err);
      }

      if (!app) {
        return cb(new Error('App Not Found'));
      }

      // in test mode do not check if domain is matching
      // however, in live mode the request domain must match the
      // app domain

      if (mode !== 'test') {
        if (!app.checkDomain(domain)) {
          return cb(new Error('Domain Not Matching'));
        }
      }

      cb(null, app);

    });

}


/**
 * Expose private functions for testing
 */

module.exports._findAndVerifyApp = _findAndVerifyApp;
