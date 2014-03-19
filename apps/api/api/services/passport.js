/**
 * Module dependencies
 */

var passport = require('passport'),
  LocalStrategy = require('passport-local')
    .Strategy;

/**
 * Models
 */

var Account = require('../models/Account');


// Passport session setup.
// To support persistent login sessions, Passport needs to be able to
// serialize users into and deserialize users out of the session. Typically,
// this will be as simple as storing the user ID when serializing, and finding
// the user by ID when deserializing. However, since this example does not
// have a database of user records, the complete Google profile is
// serialized and deserialized.

// serialize sessions
passport.serializeUser(function (account, done) {
  done(null, account._id);
});

// deserialize sessions
passport.deserializeUser(function (id, done) {

  Account.findOne({
    _id: id
  }, function (err, account) {

    if (err) {
      return done(null, null);
    }

    done(null, account);

  });

});


// login through email and password
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },

  function (email, password, done) {
    Account
      .findOne({
        email: email
      })
      .select('+password')
      .exec(function (err, account) {

        if (err) {
          return done(err);
        }

        if (!account) {
          return done(null, false, {
            message: 'Email Not Found'
          });
        }

        account.comparePassword(password, function (err, isMatch) {

          if (err) {
            return done(err);
          }

          if (!isMatch) {
            return done(null, false, {
              message: 'Invalid Password'
            });
          }

          done(null, account, {
            message: 'Logged In Successfully'
          });

        });

      });

  }));
