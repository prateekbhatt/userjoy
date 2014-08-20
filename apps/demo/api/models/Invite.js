/**
 * Model for invites belonging to an app
 */


/**
 * npm dependencies
 */

var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var troop = require('mongoose-troop');

var Schema = mongoose.Schema;


/**
 * Define invite schema
 */

var InviteSchema = new Schema({


  // app Id
  aid: {
    type: Schema.Types.ObjectId,
    ref: 'App',
    required: [true, 'Invalid aid']
  },


  // created at timestamp
  ct: {
    type: Date,
    default: Date.now
  },


  from: {
    type: Schema.Types.ObjectId,
    ref: 'Account',
    required: [true, 'Invalid from-account id']
  },


  // email of the invitee
  toEmail: {
    type: String,
    required: [true, 'Provide invitee email']
  }

});


var Invite = mongoose.model('Invite', InviteSchema);

module.exports = Invite;
