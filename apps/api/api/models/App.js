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
    required: [true, 'App name is required'],
    // validate: appNameValidator
  },


  // to show or not to show message box on website
  showMessageBox: {
    type: Boolean,
    default: true
  },


  team: [TeamMemberSchema],


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


var App = mongoose.model('App', AppSchema);

module.exports = App;
