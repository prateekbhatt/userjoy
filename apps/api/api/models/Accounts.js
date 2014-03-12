/**
 * Accounts.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs    :: http://sailsjs.org/#!documentation/models
 */

var bcrypt = require('bcrypt'),
  uuid = require('node-uuid'),
  _ = require("lodash");

module.exports = {

  schema: true,

  attributes: {

    firstName: {
      type: 'string'
    },

    lastName: {
      type: 'string'
    },

    email: {
      type: 'email',
      required: true,
      unique: true
    },

    encryptedPassword: {
      type: 'string'
    },

    sessionTokens: {
      type: 'array'
    },

    passwordResetToken: {
      type: 'json'
    },

    apiKey: {
      type: 'string',
      unique: true
    },


    /**
     * Get account's full name
     */
    fullName: function () {
      return _.compact([this.firstName, this.lastName])
        .join(' ');
    },

    /**
     * Custom toJSON() implementation. Removes unwanted attributes.
     */

    toJSON: function () {
      var account = this.toObject();
      delete account.password;
      delete account.encryptedPassword;
      delete account.sessionTokens;
      delete account._csrf;
      return account;
    },

    /**
     * Check if the supplied password matches the stored password.
     */

    validatePassword: function (candidatePassword, cb) {
      bcrypt.compare(candidatePassword, this.encryptedPassword, cb);
    },

    /**
     * Generate password reset token
     */

    generatePasswordResetToken: function (cb) {
      this.passwordResetToken = Token.generate();
      this.save(cb);
    },

    /**
     * Send password reset email
     *
     * Generate a password reset token and send an email to the account with
     * instructions to reset their password
     */

    sendPasswordResetEmail: function (cb) {
      var self = this;

      this.generatePasswordResetToken(function (err) {
        if (err) {
          return cb(err);
        }

        // Send email
        var email = new Email._model({
          to: {
            name: self.fullName(),
            email: self.email
          },
          subject: "Reset your password",
          data: {
            resetURL: sails.config.hosts.dashboard + '/reset-password/#/' +
              self.id + '/' + self.passwordResetToken.value
          },
          tags: ['password-reset', 'transactional'],
          template: 'password-reset'
        });

        email.setDefaults();

        email.send(function (err, res, msg) {
          cb(err, res, msg, self.passwordResetToken);
        });
      });
    }

  },

  /**
   * Functions that run before a account is created
   */

  beforeCreate: [
    // Encrypt account's password
    function (values, cb) {

      if (!values.password) {
        return cb({
          err: 'Provide a password'
        });
      }

      Accounts.encryptPassword(values, cb);
    },

    // Create an API key
    function (values, cb) {
      values.apiKey = uuid.v4();
      cb();
    }
  ],

  /**
   * Functions that run before a account is updated
   */

  beforeUpdate: [
    // Encrypt account's password, if changed
    function (values, cb) {
      if (!values.password) {
        return cb();
      }

      Accounts.encryptPassword(values, cb);
    }
  ],

  /**
   * Accounts password encryption. Uses bcrypt.
   */

  encryptPassword: function (values, cb) {
    bcrypt.hash(values.password, 10, function (err, encryptedPassword) {
      if (err) {
        return cb(err);
      }
      values.encryptedPassword = encryptedPassword;
      cb();
    });
  },

  /**
   * Issue a session token for a account
   */

  issueSessionToken: function (account, cb) {
    if (!account || typeof account === 'function') {
      return cb("A account model must be supplied");
    }

    if (!account.sessionTokens) {
      account.sessionTokens = [];
    }

    var token = uuid.v4();

    account.sessionTokens.push({
      token: token,
      issuedAt: new Date()
    });

    account.save(function (err) {
      cb(err, token);
    });
  },

  /**
   * Consume a account's session token
   */

  consumeSessionToken: function (token, cb) {
    if (!token || typeof token === 'function') {
      return cb("A token must be supplied");
    }

    Accounts.findOne({
      'sessionTokens.token': token
    }, function (err, account) {

      if (err) {
        return cb(err);
      }

      if (!account) {
        return cb(null, false);
      }

      // Remove the consumed session token so it can no longer be used
      if (account.sessionTokens) {
        account.sessionTokens.forEach(function (sessionToken, index) {
          if (sessionToken.token === token) {
            delete account.sessionTokens[index];
          }
        });
      }

      // Remove falsy tokens
      account.sessionTokens = _.compact(account.sessionTokens);

      // Save
      account.save(function (err) {
        return cb(err, account);
      });
    });
  }

};
