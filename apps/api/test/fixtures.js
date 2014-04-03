/**
 * Bootstrap the test database
 * before running tests
 *
 * Fixtures are being created using
 * Mocha and Supertest
 */

var accounts = {

  first: {
    name: 'Prateek',
    email: 'prateek@example.com',
    password: 'testingnewapp'
  },

  second: {
    name: 'Savinay',
    email: 'savinay@example.com',
    password: 'newapptest'
  },
},

  apps = {

    first: {
      name: 'First App',
      domain: 'firstapp.co'
    },

    second: {
      name: 'Second App',
      domain: 'secondapp.co'
    }
  },

  savedFirstAccount,
  savedSecondAccount,
  savedApp,

  loginCookie;


function createAccount(account, fn) {

  var rawPassword = account.password;

  request
    .post('/account')
    .send(account)
    .expect(201)
    .expect(function (res) {

      // replace password with raw/original password
      // for the purpose of testing
      res.body.password = rawPassword;
    })
    .end(function (err, res) {

      if (err) return fn(err);
      fn(null, res.body);

    });

}

function createApp(app, fn) {

  request
    .post('/apps')
    .set('cookie', loginCookie)
    .send(app)
    .expect(201)
    .end(function (err, res) {
      if (err) return fn(err);
      fn(null, res.body);
    });

}

function loginUser(email, password, done) {

  request
    .post('/auth/login')
    .send({
      email: email,
      password: password
    })
    .expect({
      message: 'Logged In Successfully'
    })
    .expect(200)
    .end(done);
};


module.exports = function loadFixtures(callback) {

  async.series({

    createFirstAccount: function (cb) {

      createAccount(accounts.first, function (err, acc) {
        if (err) return cb(err);
        accounts.first = acc;
        cb();
      });

    },

    createSecondAccount: function (cb) {

      createAccount(accounts.second, function (err, acc) {
        if (err) return cb(err);
        accounts.second = acc;
        cb();
      });

    },

    loginFirstAccount: function (cb) {

      loginUser(accounts.first.email, accounts.first.password, function (err,
        res) {
        loginCookie = res.headers['set-cookie'];
        cb(err);
      });

    },

    createFirstApp: function (cb) {

      createApp(apps.first, function (err, app) {
        if (err) return cb(err);
        apps.first = app;
        cb();
      });

    },

    logout: function (cb) {
      logoutUser(cb);
    },


    loginSecondAccount: function (cb) {

      loginUser(accounts.second.email, accounts.second.password, function (
        err,
        res) {
        loginCookie = res.headers['set-cookie'];
        cb(err);
      });

    },

    createSecondApp: function (cb) {

      createApp(apps.second, function (err, app) {
        if (err) return cb(err);
        apps.second = app;
        cb();
      });

    },

    logout: function (cb) {
      logoutUser(cb);
    },


  }, function (err) {

    callback(err, {
      accounts: accounts,
      apps: apps
    });

  });
}
