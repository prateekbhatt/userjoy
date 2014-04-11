/**
 * This module contains the Track Constructor which is used to
 * store new events
 */

/**
 * Module dependencies
 */

var async = require('async');


/**
 * Models
 */

var App = require('../models/App');
var User = require('../models/User');


/**
 * Expose the Track constructor
 */

module.exports = Track;


/**
 * Track constructor
 * @param {object} obj contains appKey, domain, cookies, user, company,
 *                     session, event
 */

function Track(obj) {

  this.appKey = obj.appKey;
  this.domain = obj.domain;
  this.mode = null;
  this.app = null;
  this.uid = null;
  this.cid = null;
  this.sid = null;
  this.user = obj.user || {};
  this.company = obj.company || {};
  this.session = obj.session || {};
  this.event = obj.event || {};

  this._setIdsFromCookies(obj.cookies);
  this._setMode();

  return this;
}


/**
 * Sets user, company and session ids from the cookies object
 *
 * @param  {object} cookies
 * @return {Track}
 */

Track.prototype._setIdsFromCookies = function (cookies) {
  this.uid = cookies['dodatado.uid'];
  this.cid = cookies['dodatado.cid'];
  this.sid = cookies['dodatado.sid'];
  return this;
};


Track.prototype._setMode = function () {
  this.mode = this.appKey.split('_')[0];
  return this;
};


Track.prototype._findApp = function (cb) {

  var self = this;
  var mode = self.mode;
  var appKey = self.appKey;

  App
    .findByKey(mode, appKey, function (err, app) {

      if (err) {
        return cb(err);
      }

      if (!app) {
        return cb(new Error('App Not Found'));
      }

      self.app = app;

      cb();

    });
};

Track.prototype._verifyApp = function (cb) {

  var self = this;

  // in test mode do not check if domain is matching
  // however, in live mode the request domain must match the
  // app domain

  if (self.mode !== 'test') {
    if (!self.app.checkDomain(self.domain)) {
      return cb(new Error('Domain Not Matching'));
    }
  }

  cb();

};

Track.prototype._checkOrCreateCompany = function (cb) {
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

};


/**
 * Checks if uid exists
 * else calls User.getOrCreate and attaches
 * this.uid with new user._id
 *
 * @param {function} cb callback function
 * @return {Track}
 */

Track.prototype._checkOrCreateUser = function (cb) {

  var self = this;

  // if valid uid, move on
  // else getOrCreate user

  if (self.uid) {
    return cb();
  }

  User.getOrCreate(self.app._id, self.user, function (err, usr) {

    if (err) {
      return cb(err);
    }

    self.uid = usr._id;

    cb();
  });

  return this;

};


Track.prototype._checkOrCreateSession = function (cb) {

  // if valid session id, move on
  // else create new session

  if (sid) {
    return cb();
  }

  // TODO create new session
  cb();
};

Track.prototype._createTrack = function (cb) {
  cb();
};

Track.prototype.save = function (cb) {

  var self = this;

  async.series([


    function (cb) {
      self._findApp.call(self, cb);
    },


    function (cb) {
      self._verifyApp.call(self, cb);
    },


    // function (cb) {
    //   self._checkOrCreateCompany.call(self, cb);
    // },


    function (cb) {
      self._checkOrCreateUser.call(self, cb);
    },


    // function (cb) {
    //   self._checkOrCreateSession.call(self, cb);
    // },


    // function createTrack(cb) {
    //   self._createTrack.call(self, cb);
    // }


  ], function (err) {
    cb(err);
  });
};
