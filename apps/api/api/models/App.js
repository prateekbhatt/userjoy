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
 * Define schema
 */

var AppSchema = new Schema({

  name: {
    type: String,
    required: [true, 'App name is required'],
    // validate: appNameValidator
  },

  domain: {
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

  // admin/owner of the app
  admin: {
    type: Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },

  // isActive is set to true when we start recieveing data from the app
  isActive: {
    type: Boolean,
    default: false
  }

  // TODO : Allow to add team members
  //
  // other members added by the admin
  // team: [{
  //   type: Schema.Types.ObjectId,
  //   ref: 'Account'
  // }]

});


/**
 * Adds createdAt and updatedAt timestamps
 */

AppSchema.plugin(troop.timestamp, {
  createdPath: 'createdAt',
  modifiedPath: 'updatedAt',
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
      admin: accountId
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
 * Checks if request domain matches app domain
 * Used to authenticate event calls
 *
 * @param {string} domain url
 * @return {boolean}
 */

AppSchema.methods.checkDomain = function (domain) {
  if (!domain) {
    throw new Error('Invalid Domain');
  }
  return (this.domain === domain);
};


var App = mongoose.model('App', AppSchema);

module.exports = App;
