var Sails = require('sails'),

  // create a variable to hold the instantiated sails server
  app,

  DbServer = require('../node_modules/sails-mongo/node_modules/mongodb')
    .Server,
  Db = require('../node_modules/sails-mongo/node_modules/mongodb')
    .Db;


function createConnection(config, cb) {
  var safe = config.safe ? 1 : 0;
  var server = new DbServer(config.host, config.port, {
    native_parser: config.nativeParser,
    auth: {
      user: config.user,
      password: config.password
    }
  });
  var db = new Db(config.database, server, {
    w: safe,
    native_parser: config.nativeParser
  });

  db.open(function (err) {
    if (err) return cb(err);
    if (db.serverConfig.options.auth.user && db.serverConfig.options.auth.password) {
      return db.authenticate(db.serverConfig.options.auth.user, db.serverConfig
        .options.auth.password, function (err, success) {
          if (success) return cb(null, db);
          if (db) db.close();
          return cb(err ? err : new Error('Could not authenticate user ' +
            auth[0]), null);
        });
    }

    return cb(null, db);
  });
}

function dropDb(cb) {
  createConnection(sails.config.connections.mongo, function (err, db) {
    db.dropDatabase(function () {
      printMessage('Test database dropped');
      cb();
    });
  });
}

function defineGlobals() {
  global.request = require('supertest')(sails.config.appUrl);
}

function printMessage(text) {
  console.log('------------------------------');
  console.log('     ', text);
  console.log('------------------------------');
  return;
}

// Global before hook
before(function (done) {
  this.timeout(10000);
  // Lift Sails and start the server
  Sails.lift({

    log: {
      level: 'error'
    },

  }, function (err, sails) {

    if (!err) {
      printMessage("Test server lifted");
    }

    app = sails;

    defineGlobals();

    if (err) {
      return done(err);
    }

    dropDb(function () {
      done(err, sails);
    });

  });
});

// Global after hook
after(function (done) {
  app.lower(function (err) {

    if (!err) {
      console.log('\n\n');
      printMessage("Test server lowered");
    }

    if (err) {
      return done(err);
    }

    // dropDb(done);
    done();
  });
});
