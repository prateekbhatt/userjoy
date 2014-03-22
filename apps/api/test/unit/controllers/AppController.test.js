describe('Resource /apps', function () {

  var newApp = {
    name: 'My New App'
  },

    randomId = '532d6bf862d673ba7131812a',

    saved,

    loginEmail,
    loginPassword;


  before(function (done) {

    loadFixtures(function (err, savedData) {

      if (err) return done(err);

      saved = savedData;

      loginEmail = saved.accounts.first.email;
      loginPassword = saved.accounts.first.password;

      logoutUser(done);
    });

  });


  after(function (done) {
    dropTestDb(done);
  });

  describe('POST /apps', function () {


    before(function (done) {
      logoutUser(done);
    });


    it('returns error if not logged in',

      function (done) {

        request
          .post('/apps')
          .send(newApp)
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
        loginUser(loginEmail, loginPassword, done);
      });


    it('creates new app',

      function (done) {

        request
          .post('/apps')
          .send(newApp)
          .expect('Content-Type', /json/)
          .expect(201)
          .expect(function (res) {
            if (res.body.name !== newApp.name) {
              return 'Saved app\'s name does not match';
            }
          })
          .end(done);

      });

  });


  describe('GET /apps', function () {


    before(function (done) {
      logoutUser(done);
    });


    it('returns error if not logged in',

      function (done) {

        request
          .get('/apps')
          .send(newApp)
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
        loginUser(loginEmail, loginPassword, done);
      });


    it('fetches all apps belonging to account',

      function (done) {

        request
          .get('/apps')
          .expect('Content-Type', /json/)
          .expect(function (res) {
            if (!Array.isArray(res.body)) {
              return 'Should return an array';
            }
          })
          .expect(200)
          .end(done);

      });

  });

  describe('GET /apps/:appId', function () {


    before(function (done) {
      logoutUser(done);
    });


    it('returns error if not logged in',

      function (done) {

        request
          .get('/apps/' + randomId)
          .expect('Content-Type', /json/)
          .expect(401)
          .end(done);
      });


    it('logging in user',

      function (done) {
        loginUser(loginEmail, loginPassword, done);
      });


    it('fetches app with given id',

      function (done) {

        request
          .get('/apps/' + saved.apps.first._id)
          .expect('Content-Type', /json/)
          .expect(function (res) {
            if (res.body.admin !== saved.accounts.first._id) {
              return 'Could not fetch saved app';
            }
          })
          .expect(200)
          .end(done);

      });


    it('returns error if no app with id is present',

      function (done) {

        var randomId = '5303570d9c554e7356000017';

        request
          .get('/apps/' + randomId)
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
          .expect('Content-Type', /json/)
          .expect(403)
          .end(done);

      });
  });


  describe('PUT /apps/:appId/name', function () {

    before(function (done) {
      logoutUser(done);
    });

    it('returns error if not logged in',

      function (done) {

        var newName = 'Heres my new name';

        request
          .put('/apps/' + saved.apps.first._id + '/name')
          .send({
            name: newName
          })
          .expect('Content-Type', /json/)
          .expect(401)
          .end(done);

      });


    it('logging in user', function (done) {
      loginUser(loginEmail, loginPassword, done);
    });


    it('updates app name',

      function (done) {

        var newName = 'New App Name';

        request
          .put('/apps/' + saved.apps.first._id + '/name')
          .send({
            name: newName
          })
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(function (res) {
            if (res.body.name !== newName) {
              return 'Name was not updated';
            }
          })
          .end(done);

      });

  });

});
