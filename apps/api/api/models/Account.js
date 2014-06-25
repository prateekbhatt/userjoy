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
    type: String,
    required: [true, 'name is required'],
    validate: validate({
      message: "Name should be longer than 2 characters",
    }, 'len', 2)
  },

  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false,
    validate: validate({
      message: "Password should be longer than 8 characters",
    }, 'len', 8)
  },

  // email verification token
  verifyToken: {
    type: String,
    select: false
  },

  // password reset token
  passwordResetToken: {
    type: String,
    select: false
  },

  emailVerified: {
    type: Boolean,
    default: false
  }

});


/**
 * Add indexes
 */

AccountSchema.index({
  email: 1
});


/**
 * Adds ct and ut timestamps
 */

AccountSchema.plugin(troop.timestamp, {
  createdPath: 'ct',
  modifiedPath: 'ut',
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

      if (!account) {
        return cb(new Error('Account Not Found'));
      }

      if (account.verifyToken !== token) {
        return cb(new Error('Invalid Token'));
      }

      account.emailVerified = true;
      account.verifyToken = undefined;
      account.save(cb);

    });
};


AccountSchema.methods.createVerifyToken = function (cb) {
  var self = this;
  self.verifyToken = mongoose.Types.ObjectId();
  self.save(function (err, acc) {
    if (err) return cb(err);
    var verifyToken = self.verifyToken;
    cb(null, acc, verifyToken);
  });
};


/**
 * Create a reset password token
 * @param  {string}   email email of the user
 * @param  {Function} fn    callback function
 */
AccountSchema.statics.createResetPasswordToken = function (email, fn) {

  if (!email) {
    return fn(new Error('Invalid Email'));
  }

  async.waterfall([

    // find account
    function (cb) {

      Account.findOne({

        email: email

      }, function (err, account) {

        if (err) {
          return cb(err);
        }

        if (!account) {
          return cb(new Error('Account Not Found'));
        }

        cb(null, account);
      });

    },

    // createToken
    function (account, cb) {

      createToken(function (err, token) {
        cb(err, account, token)
      });

    },

    // save password reset token
    function (account, token, cb) {

      account.passwordResetToken = token;
      account.save(cb);

    }

  ], function (err, account) {

    fn(err, account);

  });

}


/**
 * Updates account password
 * @param  {string}   currPass current password of the account
 * @param  {string}   newPass new password
 * @param  {function} cb      callback function
 */
AccountSchema.methods.updatePassword = function (currPass, newPass, cb) {
  var self = this;

  // in schema, password field has attribute select: false
  // so the password field needs to retrieved again
  Account
    .findById(self._id)
    .select('password')
    .exec(function (err, usr) {

      if (err) {
        return cb(err);
      }

      self = usr;

      self.comparePassword(currPass, function (err, isMatch) {
        if (err) {
          return cb(err);
        }

        if (!isMatch) {
          return cb(new Error('Incorrect Password'));
        }

        self.password = newPass;
        self.save(cb);
      });
    });

};


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
