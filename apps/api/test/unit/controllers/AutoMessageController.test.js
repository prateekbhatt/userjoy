describe('Resource /apps/:aid/automessages', function () {

  var randomId = '532d6bf862d673ba7131812a';
  var aid;
  var url;


  before(function (done) {
    setupTestDb(function (err) {
      aid = saved.apps.first._id;
      url = '/apps/' + aid + '/automessages';
      done(err);
    });
  });


  describe('POST /apps/:aid/automessages', function () {

    var savedMsg;

    var newAutoMsg = {};

    before(function (done) {
      logoutUser(done);
    });


    it('returns error if not logged in', function (done) {

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

    it(
      'should return error if body/sid/title/type is not present',
      function (done) {

        request
          .post(url)
          .set('cookie', loginCookie)
          .send({})
          .expect('Content-Type', /json/)
          .expect(400)
          .expect({
            "error": [
              "Provide automessage type",
              "Provide automessage title",
              "Invalid segment id",
              "Provide automessage body",
            ],
            "status": 400
          })
          .end(done);

      });


    it('should create new automessage',

      function (done) {

        var newAutoMsg = {
          body: 'Hey, Welkom to CabanaLand!',
          sender: randomId,
          sid: randomId,
          sub: 'Welkom!',
          title: 'Welcome Message',
          type: 'email'
        };

        request
          .post(url)
          .set('cookie', loginCookie)
          .send(newAutoMsg)
          .expect('Content-Type', /json/)
          .expect(201)
          .expect(function (res) {
            savedMsg = res.body;

            expect(savedMsg)
              .to.have.property("creator", saved.accounts.first._id.toString());

            expect(savedMsg)
              .to.have.property("sender", newAutoMsg.sender);

            expect(savedMsg)
              .to.have.property("type", newAutoMsg.email);

            expect(savedMsg)
              .to.have.property("aid", aid.toString());

          })
          .end(done);

      });


    it('should add logged in user as sender, if sender not provided',

      function (done) {

        var newAutoMsg = {
          body: 'Hey, Welkom to CabanaLand!',
          sid: randomId,
          sub: 'Welkom!',
          title: 'Welcome Message',
          type: 'email'
        };

        request
          .post(url)
          .set('cookie', loginCookie)
          .send(newAutoMsg)
          .expect('Content-Type', /json/)
          .expect(201)
          .expect(function (res) {
            var savedMsg = res.body;

            expect(savedMsg)
              .to.have.property("creator", saved.accounts.first._id.toString());

            expect(savedMsg)
              .to.have.property("sender", saved.accounts.first._id.toString());

            expect(savedMsg)
              .to.have.property("type", newAutoMsg.email);

            expect(savedMsg)
              .to.have.property("aid", aid.toString());

          })
          .end(done);

      });

  });


  describe('GET /apps/:aid/automessages', function () {


    before(function (done) {
      logoutUser(done);
    });


    it('returns error if not logged in',

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


    it('fetches all automessages belonging to app',

      function (done) {

        request
          .get(url)
          .set('cookie', loginCookie)
          .expect('Content-Type', /json/)
          .expect(function (res) {

            expect(res.body)
              .to.be.an("array");

            expect(res.body)
              .to.not.be.empty;
          })
          .expect(200)
          .end(done);

      });

  });

  describe('GET /apps/:aid/automessages/:amId', function () {

    var savedAutoMessageId;
    var testUrl;

    before(function (done) {
      logoutUser(function (err) {
        savedAutoMessageId = saved.automessages.first._id;
        testUrl = url + '/' + savedAutoMessageId;
        done(err);
      });
    });


    it('returns error if not logged in',

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


    it('fetches automessage with given id',

      function (done) {

        request
          .get(testUrl)
          .set('cookie', loginCookie)
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(function (res) {

            expect(res.body)
              .to.not.be.empty;

            // it should populate the automessage sender name and email
            expect(res.body)
              .to.have.property("sender")
              .that.is.an('object')
              .and.has.keys(['_id', 'email', 'name']);

            // it should populate the automessage segment name
            expect(res.body)
              .to.have.property("sid")
              .that.is.an('object')
              .and.has.keys(['_id', 'name']);

            expect(res.body.title)
              .to.eql('Welcome Message');
          })
          .end(done);

      });


    it('returns error if no app with id is present',

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


    it('returns error if user doesnt have access to app',

      function (done) {

        request
          .get('/apps/' + saved.apps.second._id)
          .set('cookie', loginCookie)
          .expect('Content-Type', /json/)
          .expect(403)
          .end(done);

      });
  });


  describe('PUT /apps/:aid/automessages/:amId/send-test', function () {

    var savedAutoMessageId;
    var testUrl;

    before(function (done) {
      logoutUser(function (err) {
        savedAutoMessageId = saved.automessages.first._id;
        testUrl = url + '/' + savedAutoMessageId + '/send-test';
        done(err);
      });
    });


    it('returns error if not logged in',

      function (done) {

        request
          .put(testUrl)
          .expect('Content-Type', /json/)
          .expect(401)
          .end(done);
      });


    it('logging in user',

      function (done) {
        loginUser(done);
      });


    it('should send automessage to the user', function (done) {

      request
        .put(testUrl)
        .set('cookie', loginCookie)
        .expect('Content-Type', /json/)
        .expect({
          message: 'Message is queued'
        })
        .expect(200)
        .end(done);

    });

  });


  describe('PUT /apps/:aid/automessages/:amId/active/:status', function () {

    var savedAutoMessageId;
    var testUrl;

    before(function (done) {
      logoutUser(function (err) {
        savedAutoMessageId = saved.automessages.first._id;
        testUrl = url + '/' + savedAutoMessageId + '/active';
        done(err);
      });
    });


    it('returns error if not logged in', function (done) {

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


    it('should return error is active status is neither true nor false',
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

    it('should update active status of automessage', function (done) {

      expect(saved.automessages.first.active)
        .to.be.false;

      var statusTestUrl = testUrl + '/true';

      request
        .put(statusTestUrl)
        .set('cookie', loginCookie)
        .expect('Content-Type', /json/)
        .expect(function (res) {

          expect(res.body)
            .to.be.an("object");

          expect(res.body.active)
            .to.be.true;
        })
        .expect(200)
        .end(done);

    });

  });

  describe('PUT /apps/:aid/automessages/:amId', function () {

    var savedMsg;
    var newAutoMsg = {};
    var testUrl;

    before(function (done) {
      savedMsg = saved.automessages.first;
      testUrl = url + '/' + savedMsg._id;
      logoutUser(done);
    });


    it('returns error if not logged in', function (done) {

      request
        .put(testUrl)
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


    it('should update automessage body, sub and title',

      function (done) {

        var updatedMsg = {
          body: 'Updated Land!',
          sub: 'Updated Subland',
          title: 'Updated TitleLand!',
        };

        request
          .put(testUrl)
          .set('cookie', loginCookie)
          .send(updatedMsg)
          .expect('Content-Type', /json/)
          .expect(201)
          .expect(function (res) {

            savedMsg = res.body;

            expect(savedMsg)
              .to.have.property("body", updatedMsg.body);

            expect(savedMsg)
              .to.have.property("sub", updatedMsg.sub);

            expect(savedMsg)
              .to.have.property("title", updatedMsg.title);

          })
          .end(done);

      });

  });


});
