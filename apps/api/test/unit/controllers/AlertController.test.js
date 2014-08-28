describe('Resource /apps/:aid/alerts', function () {

  var randomId = '532d6bf862d673ba7131812a';
  var aid;
  var url;


  before(function (done) {
    setupTestDb(function (err) {
      aid = saved.apps.first._id;
      url = '/apps/' + aid + '/alerts';
      done(err);
    });
  });


  describe('POST /apps/:aid/alerts', function () {

    var savedAlert;

    var newAlert = {};

    before(function (done) {
      logoutUser(done);
    });


    it('should return error if not logged in', function (done) {

      request
        .post(url)
        .send({})
        .expect('Content-Type', /json/)
        .expect(401)
        .expect({
          status: 401,
          error: 'Unauthorized'
        })
        .end(done);

    });


    it('logging in user',

      function (done) {
        loginUser(done);
      });

    it('should return error if sid is not present',
      function (done) {

        request
          .post(url)
          .set('cookie', loginCookie)
          .send({})
          .expect('Content-Type', /json/)
          .expect(400)
          .expect({
            "error": [
              "Provide enters / leaves status",
              "Provide alert title",
              "Invalid segment id"
            ],
            "status": 400
          })
          .end(done);

      });


    it('should create new alert', function (done) {

      // WARNING: dont provide a randomId for sid, because in a later test
      // sid is being populated, and it returns error

      var newAlert = {
        sid: saved.segments.first._id,
        team: [saved.accounts.first._id],
        title: 'New Signups',
        when: 'enters'
      };

      request
        .post(url)
        .set('cookie', loginCookie)
        .send(newAlert)
        .expect('Content-Type', /json/)
        .expect(201)
        .expect(function (res) {

          var s = res.body.alert;

          expect(s)
            .to.have.property('segment')
            .that.has.keys(['_id', 'name']);

          expect(s)
            .to.have.property('team')
            .that.is.an('array')
            .and.to.contain(saved.accounts.first._id.toString());

          expect(s)
            .to.have.property("when", newAlert.when);

          expect(s)
            .to.have.property("aid", aid.toString());

        })
        .end(done);

    });

  });


  describe('GET /apps/:aid/alerts', function () {


    before(function (done) {
      logoutUser(done);
    });


    it('should return error if not logged in',

      function (done) {

        request
          .get(url)
          .send({})
          .expect('Content-Type', /json/)
          .expect(401)
          .expect({
            status: 401,
            error: 'Unauthorized'
          })
          .end(done);

      });


    it('logging in user',

      function (done) {
        loginUser(done);
      });


    it('should fetch all alerts belonging to app',

      function (done) {

        request
          .get(url)
          .set('cookie', loginCookie)
          .expect('Content-Type', /json/)
          .expect(function (res) {
            var a = res.body.alerts;

            expect(a)
              .to.be.an("array");

            expect(a)
              .to.not.be.empty;

            _.each(a, function (alert) {

              expect(alert)
                .to.be.an('object')
                .and.has.property('segment')
                .that.is.an('object')
                .and.has.keys(['_id', 'name']);

            });
          })
          .expect(200)
          .end(done);

      });

  });


  describe('GET /apps/:aid/alerts/:alertId', function () {

    var savedAlertId;
    var testUrl;

    before(function (done) {
      logoutUser(function (err) {
        savedAlertId = saved.alerts.first._id;
        testUrl = url + '/' + savedAlertId;
        done(err);
      });
    });


    it('should return error if not logged in',

      function (done) {

        request
          .get(testUrl)
          .expect('Content-Type', /json/)
          .expect(401)
          .end(done);
      });


    it('logging in user',

      function (done) {
        loginUser(done);
      });


    it('should fetch alert with given id',

      function (done) {

        request
          .get(testUrl)
          .set('cookie', loginCookie)
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(function (res) {

            var alert = res.body.alert;

            expect(alert)
              .to.not.be.empty;


            expect(alert)
              .to.have.property('team')
              .that.is.an('array');

            expect(alert.team[0])
              .to.have.keys(['_id', 'name', 'email', 'active']);

            // it should populate the alert segment name
            expect(alert)
              .to.have.property("segment")
              .that.is.an('object')
              .and.has.keys(['_id', 'name']);

          })
          .end(done);

      });


    it('should return error if no app with id is present',

      function (done) {

        var randomId = '5303570d9c554e7356000017';

        request
          .get('/apps/' + randomId)
          .set('cookie', loginCookie)
          .expect('Content-Type', /json/)
          .expect(404)
          .expect({
            "error": "Not Found",
            "status": 404
          })
          .end(done);

      });


    it('should return error if user doesnt have access to app',

      function (done) {

        request
          .get('/apps/' + saved.apps.second._id)
          .set('cookie', loginCookie)
          .expect('Content-Type', /json/)
          .expect(403)
          .end(done);

      });
  });


  describe('PUT /apps/:aid/alerts/:alertId/active/:status', function () {

    var savedAlertId;
    var testUrl;

    before(function (done) {
      logoutUser(function (err) {
        savedAlertId = saved.alerts.first._id;
        testUrl = url + '/' + savedAlertId + '/active';
        done(err);
      });
    });


    it('should return error if not logged in', function (done) {

      var statusTestUrl = testUrl + '/false';
      request
        .put(statusTestUrl)
        .expect('Content-Type', /json/)
        .expect(401)
        .end(done);
    });


    it('logging in user', function (done) {
      loginUser(done);
    });


    it('should return error if active status is neither true nor false',
      function (done) {

        var statusTestUrl = testUrl + '/randomStatus';

        request
          .put(statusTestUrl)
          .set('cookie', loginCookie)
          .expect('Content-Type', /json/)
          .expect(400)
          .expect({
            "error": "Active status should be either true or false",
            "status": 400
          })
          .end(done);

      });

    it('should return error is active status is not provided',
      function (done) {

        var statusTestUrl = testUrl;

        request
          .put(statusTestUrl)
          .set('cookie', loginCookie)
          .expect('Content-Type', /json/)
          .expect(400)
          .expect({
            "error": "Active status should be either true or false",
            "status": 400
          })
          .end(done);

      });

    it('should update active status of alert', function (done) {

      expect(saved.alerts.first.active)
        .to.be.false;

      var statusTestUrl = testUrl + '/true';

      request
        .put(statusTestUrl)
        .set('cookie', loginCookie)
        .expect('Content-Type', /json/)
        .expect(function (res) {

          expect(res.body.alert)
            .to.be.an("object");

          expect(res.body.alert.active)
            .to.be.true;

        })
        .expect(200)
        .end(done);

    });

  });


});
