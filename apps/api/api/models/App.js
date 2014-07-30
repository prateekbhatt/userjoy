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


  name: {
    type: String,
    required: [true, 'App name is required']
    // validate: appNameValidator
  },


  // last date for which health was queued for update
  queuedHealth: {
    type: Date
  },


  // last date for which score was queued for update
  queuedScore: {
    type: Date
  },


  // last date for which usage was queued for update
  // updated inside usage-publisher
  queuedUsage: {
    type: Date
  },


  // to show or not to show message box on website
  showMessageBox: {
    type: Boolean,
    default: true
  },


  // dodatado.mail.userjoy.co
  //
  // this field is not required now, because when a new account is made,
  // a default app is created without the subdomain
  // sparse index is required for allowing null values
  // REF: http://stackoverflow.com/a/9693138/1463434
  subdomain: {
    type: String,
    lowercase: true,
    unique: true,
    sparse: true
  },


  team: [TeamMemberSchema],


  ut: {
    type: Date,
    default: Date.now
  }


});


/**
 * Add indexes
 */

AppSchema.index({
  'team.accid': 1
});


/**
 * Adds updated (ut) timestamps
 * Created timestamp (ct) is added by default
 */

AppSchema.pre('save', function (next) {
  this.ut = new Date;
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
 * Update the last queued times for usage/score/health queues
 *
 * @param {array or string} aids array-of-app-ids or single app-id
 * @param {string} queue usage/score/queue
 * @param {date} updateTime new-queued-time
 * @param {function} cb callback
 */

AppSchema.statics.queued = function (aids, queue, updateTime, cb) {

  if (!_.isArray(aids)) aids = [aids];

  var query = {
    _id: {
      $in: aids
    }
  };

  var update = {};

  if (queue === 'usage') {
    update.queuedUsage = updateTime;
  } else if (queue === 'score') {
    update.queuedScore = updateTime;
  } else if (queue === 'health') {
    update.queuedHealth = updateTime;
  } else {
    return cb(new Error('Queue should be one of usage/score/health'));
  }

  var options = {
    multi: true
  };

  App.update(query, update, options, cb);
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
 * When a new account signs up, we create a default app, and in the next step
 * ask the new user to integrate the code for the default app. This is being
 * done to simplify the onboarding UX for a new account
 *
 * @param {string} accid account-id
 * @param {function} cb callback
 */

AppSchema.statics.createDefaultApp = function (accid, cb) {

  var defaultApp = {
    name: 'YOUR COMPANY',
    team: []
  };

  defaultApp.team.push({
    accid: accid,
    admin: true
  });

  App.create(defaultApp, cb);
};


var App = mongoose.model('App', AppSchema);

module.exports = App;
