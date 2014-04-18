describe('Resource /track', function () {

  var CollectorController = require(
    '../../../api/routes/CollectorController');
  var AppModel = require(
    '../../../api/models/App');

  // define test variables
  var newSession = {
    'hello': 'world'
  };
  var newUser = {
    email: 'prattbhatt@gmail.com',
  };
  var randomId = '532d6bf862d673ba7131812a';
  var appKey;



  before(function (done) {
    newSession = JSON.stringify(newSession);
    newUser = JSON.stringify(newUser);
    setupTestDb(function (err) {
      appKey = saved.apps.first.testKey;
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

    it('should return the uid, companyId and sessionId', function (done) {

      var url = '/track?' +
        'app_id=' +
        appKey +
        '&user=' +
        newUser;

      function hasIds(res) {
        var obj = res.body;
        if (!(obj.uid && obj.companyId && obj.sessionId)) {
          return 'uid/companyId/sessionId missing';
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

  describe('#_findAndVerifyApp', function () {

    it('should return error if app not found', function (done) {

      var mode = 'test';
      var appKey = 'randomAppKey';
      var domain = 'randomDomain.com';

      CollectorController._findAndVerifyApp(mode, appKey, domain,
        function (err, app) {

          expect(err)
            .to.exist;

          expect(err.message)
            .to.equal('App Not Found');

          expect(app)
            .not.to.exist;

          done();

        });
    });

    // it('should checkDomain in live mode', function (done) {

    // });

    // it('should not checkDomain in test mode', function (done) {

    // });

    it('should return error if incorrect domain in live mode',
      function (done) {

        var mode = 'live';
        var appKey = saved.apps.first.liveKey;
        var domain = 'randomDomain.com';

        CollectorController._findAndVerifyApp(mode, appKey, domain,
          function (err, app) {

            expect(err)
              .to.exist;

            expect(err.message)
              .to.equal('Domain Not Matching');

            expect(app)
              .not.to.exist;

            done();

          });

      });

    it('should return app in callback', function (done) {

      var mode = 'live';
      var appKey = saved.apps.first.liveKey;
      var domain = saved.apps.first.domain;

      CollectorController._findAndVerifyApp(mode, appKey, domain,
        function (err, app) {

          expect(err)
            .not.to.exist;

          expect(app)
            .to.be.an('object');

          done();

        });
    });

  });

});
