/**
 * Module dependencies
 */

var mongoose = require('mongoose'),
  bcrypt = require('bcrypt'),
  crypto = require('crypto'),
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

  // email verification token
  verifyToken: {
    type: String,
    select: false
  },

  emailVerified: {
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
 * before creating / updating record
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
 * Middleware to generate an email verification token
 * when a new account is created
 */
AccountSchema.pre('save', function (next) {

  var user = this;

  // email verification token should
  // be created only for new users
  if (!user.isNew) {
    return next();
  }

  createToken(function (err, token) {

    user.verifyToken = token;
    next();

  });

});


/**
 * Check if input password is right
 * @param  {string}   candidatePassword password input
 * @param  {Function} cb                callback function
 */

AccountSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};


/**
 * Verify email
 * @param  {string}   accountId
 * @param  {string}   token     email verification token
 * @param  {Function} cb        callback
 */
AccountSchema.statics.verify = function (accountId, token, cb) {

  Account
    .findById(accountId)
    .select('verifyToken emailVerified')
    .exec(function (err, account) {

      if (err) {
        return cb(err);
      }

      if (account.verifyToken !== token) {
        return cb(new Error('Invalid Token'));
      }

      account.emailVerified = true;
      account.verifyToken = undefined;
      account.save(cb);

    });
}


/**
 * Generate a random token for:
 * - email verification
 * - password reset
 * @param  {Function} cb callback function
 */
function createToken(cb) {

  // create a random string
  crypto.randomBytes(48, function (ex, buf) {

    // make the string url safe
    var token = buf.toString('base64')
      .replace(/\//g, '_')
      .replace(/\+/g, '-');

    // shorten it
    token = token
      .toString()
      .slice(1, 24);

    cb(null, token);
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


var Account = mongoose.model('Account', AccountSchema);

module.exports = Account;
