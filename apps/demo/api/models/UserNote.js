/**
 * Notes regarding a user
 */


/**
 * npm dependencies
 */

var mongoose = require('mongoose');

var Schema = mongoose.Schema;


/**
 * Define usernote schema
 */

var UserNoteSchema = new Schema({


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


  creator: {
    type: Schema.Types.ObjectId,
    ref: 'Account',
    required: [true, 'Invalid creator account id']
  },


  note: {
    type: String,
    required: [true, 'Invalid note']
  },


  uid: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Invalid user id']
  },


  // updated at timestamp
  ut: {
    type: Date,
    default: Date.now
  }

});


/**
 * Add indexes
 */

UserNoteSchema.index({
  aid: 1,
  uid: 1
});


/**
 * Adds updated (ut) timestamps
 * Created timestamp (ct) is added by default
 */

UserNoteSchema.pre('save', function (next) {
  this.ut = new Date;
  next();
});


var UserNote = mongoose.model('UserNote', UserNoteSchema);


module.exports = UserNote;
