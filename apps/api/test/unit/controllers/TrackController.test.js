describe('Resource /track', function () {

  /**
   * npm dependencies
   */

  var mongoose = require('mongoose');
  var qs = require('qs');


  var TrackController = require('../../../api/routes/TrackController');
  var AppModel = require('../../../api/models/App');

  // define test variables
  var newSession = {
    'hello': 'world'
  };

  var newUser;

  var randomId = mongoose.Types.ObjectId;
  var appKey;


  before(function (done) {
    setupTestDb(function (err) {
      appKey = saved.apps.first.testKey;

      newUser = {
        email: saved.users.first.email,
      };

      newSession = JSON.stringify(newSession);
      newUser = JSON.stringify(newUser);

      done(err);
    });
  });

  describe('GET /track', function () {

    before(function (done) {
      logoutUser(done);
    });

    it('should return error if there is no app_id', function (done) {

      var url = '/track';

      request
        .get(url)
        .expect('Content-Type', /json/)
        .expect(400)
        .expect({
          status: 400,
          error: 'Please send app_id with the params'
        })
        .end(done);
    });

    it('should return error if there is no user object',
      function (done) {

        var url = '/track?' +
          'app_id=' +
          appKey;

        request
          .get(url)
          .expect('Content-Type', /json/)
          .expect(400)
          .expect({
            status: 400,
            error: 'Please send user_id or email to identify user'
          })
          .end(done);

      });

    it('should return error if user_id and email are missing',
      function (done) {

        var user = JSON.stringify({});

        var url = '/track?' +
          'app_id=' +
          appKey +
          '&user=' +
          user;

        request
          .get(url)
          .expect('Content-Type', /json/)
          .expect(400)
          .expect({
            status: 400,
            error: 'Please send user_id or email to identify user'
          })
          .end(done);

      });

    it('should create user if user does not exist', function (done) {

      var url = '/track?' +
        'app_id=' +
        appKey +
        '&user=' +
        newUser;


      request
        .get(url)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(done);

    });

    it('should return the uid, cid and sid', function (done) {

      var url = '/track?' +
        'app_id=' +
        appKey +
        '&user=' +
        newUser;

      function hasIds(res) {
        var obj = res.body;
        if (!(obj.uid && obj.cid && obj.sid)) {
          return 'uid/cid/sid missing';
        }
      }

      request
        .get(url)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(hasIds)
        .end(done);

    });


    // it('should getOrCreate user if user cookie is not present',
    //   function (done) {

    //   });

    // it(
    //   'should getOrCreate company if company cookie is not present and company object is present',
    //   function (done) {

    //   });

    // it('should create new session if session cookie is not present',
    //   function (done) {

    //   });

    // it('should return error if no user object input',

    //   function (done) {

    //     request
    //       .get('/track?' + 'session=' + newSession)
    //       .expect('Content-Type', /json/)
    //       .expect(400)
    //       .expect({
    //         status: 400,
    //         error: 'Please call user.identify with user details'
    //       })
    //       .end(done);

    //   });

  });



  describe('GET /track/notifications', function () {

    var url = '/track/notifications';

    before(function (done) {
      logoutUser(done);
    });

    it('should return error if there is no app_id', function (done) {

      request
        .get(url)
        .expect('Content-Type', /json/)
        .expect(400)
        .expect({
          status: 400,
          error: 'Please send app_id with the params'
        })
        .end(done);
    });

    it('should return error if there is no user_id or email',
      function (done) {

        var testUrl = url + '?app_id=' + appKey;

        request
          .get(testUrl)
          .expect('Content-Type', /json/)
          .expect(400)
          .expect({
            status: 400,
            error: 'Please send user_id or email to identify user'
          })
          .end(done);

      });

    it('should return most recent queued notification',
      function (done) {

        var email = saved.users.first.email;
        var testUrl = url + '?app_id=' + appKey + '&email=' + email;

        request
          .get(testUrl)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            if (err) return done(err);

            var notf = res.body;

            expect(notf)
              .to.be.an('object');

            expect(notf)
              .to.have.property("amId");

            expect(notf)
              .to.have.property("body");

            expect(notf)
              .to.have.property("ct");

            expect(notf)
              .to.have.property("seen");

            expect(notf)
              .to.have.property("sender");

            expect(notf)
              .to.have.property("uid");


            done();
          });

      });

  });


  describe('POST /track/conversations', function () {

    var url = '/track/conversations';
    var appKey;

    before(function (done) {
      appKey = saved.apps.first.liveKey;
      logoutUser(done);
    });

    it('should return error if there is no app_id', function (done) {

      request
        .post(url)
        .expect('Content-Type', /json/)
        .expect(400)
        .expect({
          status: 400,
          error: 'Please send app_id with the params'
        })
        .end(done);
    });

    it('should return error if there is no user_id or email',
      function (done) {

        var testUrl = url;
        var newCon = {
          'app_id': appKey
        };

        request
          .post(testUrl)
          .send(newCon)
          .expect('Content-Type', /json/)
          .expect(400)
          .expect({
            status: 400,
            error: 'Please send user_id or email to identify user'
          })
          .end(done);

      });

    it('should return error if there is no body',
      function (done) {

        var testUrl = url;
        var newCon = {
          'app_id': appKey,
          'email': saved.users.first.email
        };

        request
          .post(testUrl)
          .send(newCon)
          .expect('Content-Type', /json/)
          .expect(400)
          .expect({
            status: 400,
            error: 'Please write a message'
          })
          .end(done);

      });

    it('should create new conversation',
      function (done) {

        var email = saved.users.first.email;
        var testUrl = url;
        var newCon = {
          'app_id': appKey,
          'email': saved.users.first.email,
          'body': 'Hey man, how are you?'
        };

        request
          .post(testUrl)
          .send(newCon)
          .expect('Content-Type', /json/)
          .expect(201)
          .end(function (err, res) {

            if (err) return done(err);

            var notf = res.body;

            expect(notf)
              .to.be.an('object');

            var savedMsg = notf.messages[0];

            expect(savedMsg)
              .to.have.property("body", newCon.body);

            expect(savedMsg)
              .to.have.property("ct");

            expect(savedMsg)
              .to.have.property("seen");

            expect(savedMsg)
              .to.have.property("sName");

            expect(notf)
              .to.have.property("uid");

            expect(notf)
              .to.have.property("uid");


            done();
          });

      });

  });


});
