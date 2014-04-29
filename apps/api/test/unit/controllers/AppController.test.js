describe('Resource /apps', function () {

  var newApp = {
    name: 'My New App'
  },

    randomId = '532d6bf862d673ba7131812a';


  before(function (done) {
    setupTestDb(done);
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
        loginUser(done);
      });

    it('should return error if name is not present', function (done) {

      var newApp = {
        url: 'dodatado.com'
      };

      request
        .post('/apps')
        .set('cookie', loginCookie)
        .send(newApp)
        .expect('Content-Type', /json/)
        .expect(400)
        .expect({
          "error": [
            "name is required"
          ],
          "status": 400
        })
        .end(done);

    });

    it('should return error if url is not present', function (done) {

      var newApp = {
        name: 'my-new-app'
      };

      request
        .post('/apps')
        .set('cookie', loginCookie)
        .send(newApp)
        .expect('Content-Type', /json/)
        .expect(400)
        .expect({
          "error": [
            "url is required"
          ],
          "status": 400
        })
        .end(done);

    });

    it('should create new app',

      function (done) {

        var newApp = {
          name: 'new-app',
          url: 'new-app.co'
        };

        request
          .post('/apps')
          .set('cookie', loginCookie)
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
        loginUser(done);
      });


    it('fetches all apps belonging to account',

      function (done) {

        request
          .get('/apps')
          .set('cookie', loginCookie)
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

  describe('GET /apps/:aid', function () {


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
        loginUser(done);
      });


    it('fetches app with given id',

      function (done) {

        request
          .get('/apps/' + saved.apps.first._id)
          .set('cookie', loginCookie)
          .expect('Content-Type', /json/)
          .expect(function (res) {
            if (res.body.team[0].accid.toString() !== saved.accounts.first._id.toString()) {
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


  describe('PUT /apps/:aid/name', function () {

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
      loginUser(done);
    });


    it('updates app name',

      function (done) {

        var newName = 'New App Name';

        request
          .put('/apps/' + saved.apps.first._id + '/name')
          .send({
            name: newName
          })
          .set('cookie', loginCookie)
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
