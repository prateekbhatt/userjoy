/**
 * Module dependencies
 */

var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var troop = require('mongoose-troop');
var validate = require('mongoose-validator')
  .validate;

var Schema = mongoose.Schema;


/**
 * Helpers
 */

var apiKey = require('../../helpers/api-key');


/**
 * Team members schema
 */

var TeamMemberSchema = new Schema({

  accid: {
    type: Schema.Types.ObjectId,
    ref: 'Account',
    required: [true, 'accid is required']
  },

  // is he admin/owner of the app
  admin: {
    type: Boolean,
    default: false
  }
});


/**
 * Define App schema
 */

var AppSchema = new Schema({


  // color theme for notification / feedback templates
  color: {
    type: String,
    default: '#39B3D7',
    required: [true, 'App theme is required']
  },


  ct: {
    type: Date,
    default: Date.now
  },


  // isActive is set to true when we start recieveing data from the app
  isActive: {
    type: Boolean,
    default: false
  },


  // if the app is live then true, else if the app is in test mode, then false
  live: {
    type: Boolean,
    default: true,
    required: [true, 'Provide valid live mode for app']
  },


  liveKey: {
    type: String,
    unique: true
  },


  name: {
    type: String,
    required: [true, 'App name is required'],
    // validate: appNameValidator
  },


  team: [TeamMemberSchema],


  testKey: {
    type: String,
    unique: true
  },


  url: {
    type: String,
    required: [true, 'Domain url is required']
  },


  ut: {
    type: Date,
    default: Date.now
  }


});


/**
 * Adds updated (ut) timestamps
 * Created timestamp (ct) is added by default
 */

AppSchema.pre('save', function (next) {
  this.ut = new Date;
  next();
});


/**
 * Middleware to add test/live keys
 * when a new app is created
 */

AppSchema.pre('save', function (next) {

  var app = this;

  // keys should be automatically added
  // only for new apps

  if (!app.isNew) {
    return next();
  }

  app.testKey = apiKey.new('test');
  app.liveKey = apiKey.new('live');

  next();

});


AppSchema.statics.findByAccountId = function (accountId, cb) {

  App
    .find({
      'team.accid': accountId
    })
    .populate('team.accid', 'name email')
    .exec(cb);

};


/**
 * Gets app with the key provided
 *
 * @param  {string}   key
 * @param  {function} cb callback
 */
AppSchema.statics.findByKey = function (key, cb) {

  var mode = key.split('_')[0];
  var conditions = {};

  if (!_.contains(['live', 'test'], mode)) {
    return cb(new Error('INVALID_APP_KEY'));
  }

  mode === 'live' ? (conditions.liveKey = key) : (conditions.testKey = key);

  App
    .findOne(conditions)
    .exec(cb);
};


/**
 * Adds a team member to an app
 * - should not already be part of the team
 *
 * @param {string} aid app-id
 * @param {string} accid team-member account id
 * @param {function} cb callback
 */

AppSchema.statics.addMember = function (aid, accid, cb) {

  async.waterfall(
    [

      function findApp(cb) {
        App
          .findById(aid)
          .exec(cb);
      },

      function checkIfInTeam(app, cb) {

        var isTeamMember = _.chain(app.team)
          .map(function (m) {
            return m.accid.toString();
          })
          .contains(accid.toString())
          .value();

        if (isTeamMember) return cb(new Error('Is Team Member'));

        cb(null, app);

      },

      function addMember(app, cb) {
        app.team.push({
          accid: accid
        });

        app.save(cb)
      }

    ],

    cb
  );
};


/**
 * Checks if request url matches app url
 * Used to authenticate event calls
 *
 * @param {string} url
 * @return {boolean}
 */

AppSchema.methods.checkUrl = function (url) {
  if (!url) {
    throw new Error('Invalid Url');
  }
  return (this.url === url);
};


var App = mongoose.model('App', AppSchema);

module.exports = App;
