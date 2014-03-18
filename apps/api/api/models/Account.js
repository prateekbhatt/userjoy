/**
 * Module dependencies
 */

var mongoose = require('mongoose'),
  bcrypt = require('bcrypt'),
  Schema = mongoose.Schema,
  troop = require('mongoose-troop'),
  async = require('async'),
  _ = require('lodash'),
  validate = require('mongoose-validator')
    .validate;


/**
 * Bcrypt hash salt work factor
 * @type {Number}
 */

var SALT_WORK_FACTOR = 10;


var AccountSchema = new Schema({

  email: {
    type: String,
    unique: [true, 'Email is already present'],
    lowercase: true,
    required: [true, 'Email is required'],
    validate: validate('isEmail')

  },

  name: {
    type: String
  },

  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false
  },

  verified: {
    type: Boolean,
    default: false
  }

});


/**
 * Adds createdAt and updatedAt timestamps
 */

AccountSchema.plugin(troop.timestamp, {
  createdPath: 'createdAt',
  modifiedPath: 'updatedAt',
  useVirtual: false
});



/**
 * Bcrypt middleware to hash passwords
 */

AccountSchema.pre('save', function (next) {

  var user = this;

  if (!user.isModified('password')) {
    return next();
  }

  bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {

    if (err) {
      return next(err);
    }

    bcrypt.hash(user.password, salt, function (err, hash) {

      if (err) {
        return next(err);
      }

      user.password = hash;

      next();
    });

  });
});


/**
 * Check if input password is right
 * @param  {string}   candidatePassword password input
 * @param  {Function} cb                callback function
 */

AccountSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.pass, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

// Remember Me implementation helper method
// AccountSchema.methods.generateRandomToken = function () {
//   var user = this,
//     chars =
//       "_!abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
//     token = new Date()
//       .getTime() + '_';

//   for (var x = 0; x < 16; x++) {
//     var i = Math.floor(Math.random() * 62);
//     token += chars.charAt(i);
//   }
//   return token;
// };


// AccountSchema.methods.hasRole = function (role) {
//   for (var i = 0; i < this.roles.length; i++) {
//     if (this.roles[i] === role) {
//       // if the role that we are chekign matches the 'role' we are
//       // looking for return true
//       return true;
//     }
//   }
//   // if the role does not match return false
//   return false;
// };


var _model = mongoose.model('Account', AccountSchema);

module.exports = _model;
