var Sails = require('sails');

// create a variable to hold the instantiated sails server
var app;

// Global before hook
before(function (done) {
  // Lift Sails and start the server
  Sails.lift({

    log: {
      level: 'error'
    },

  }, function (err, sails) {

    if (!err) {
      console.log('------------------------------');
      console.log('     Test server lifted');
      console.log('------------------------------');
      console.log('\n\n');
    }

    app = sails;
    done(err, sails);
  });
});

// Global after hook
after(function (done) {
  app.lower(function (err) {
    if (!err) {
      console.log('\n\n');
      console.log('------------------------------');
      console.log('     Test server lowered');
      console.log('------------------------------');
    }
    done(err);
  });
});
