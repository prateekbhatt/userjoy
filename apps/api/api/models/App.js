/**
 * Module dependencies
 */

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  troop = require('mongoose-troop'),
  async = require('async'),
  _ = require('lodash'),
  validate = require('mongoose-validator')
    .validate;

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

  name: {
    type: String,
    required: [true, 'App name is required'],
    // validate: appNameValidator
  },

  url: {
    type: String,
    required: [true, 'Domain url is required']
  },

  testKey: {
    type: String,
    unique: true
  },

  liveKey: {
    type: String,
    unique: true
  },

  // isActive is set to true when we start recieveing data from the app
  isActive: {
    type: Boolean,
    default: false
  },

  // TODO : Allow to add team members
  //
  // other members added by the admin
  team: [TeamMemberSchema]

});


/**
 * Adds ct and ut timestamps
 */

AppSchema.plugin(troop.timestamp, {
  createdPath: 'ct',
  modifiedPath: 'ut',
  useVirtual: false
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
    .exec(cb);

};


/**
 * Gets app with the key provided
 *
 * @param  {string}   mode test/live
 * @param  {string}   key
 * @param  {function} cb callback function
 */
AppSchema.statics.findByKey = function (mode, key, cb) {
  var query = {};

  mode === 'live' ? (query.liveKey = key) : (query.testKey = key);

  App
    .findOne(query)
    .exec(cb);
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
