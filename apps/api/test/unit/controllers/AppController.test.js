describe('Resource /apps', function () {

  /**
   * npm dependencies
   */

  var mongoose = require('mongoose');


  /**
   * Models
   */

  var Invite = require('../../../api/models/Invite');



  var newApp = {
    name: 'My New App'
  };

  var randomId = mongoose.Types.ObjectId;


  before(function (done) {
    setupTestDb(done);
  });


  describe('POST /apps', function () {

    var createdApp;

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
            createdApp = res.body;
            if (res.body.name !== newApp.name) {
              return 'Saved app\'s name does not match';
            }
          })
          .end(done);

      });

    it('should add the app creator to the team and make him admin',
      function () {

        var loginUserAccid = saved.accounts.first._id;

        expect(createdApp.team)
          .to.have.length(1);

        expect(createdApp.team[0].admin)
          .to.eql(true);

        expect(createdApp.team[0].accid.toString())
          .to.eql(loginUserAccid.toString());
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
          .get('/apps/' + randomId())
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
            if (res.body.team[0].accid.toString() !== saved.accounts.first
              ._id.toString()) {
              return 'Could not fetch saved app';
            }
          })
          .expect(200)
          .end(done);

      });


    it('returns error if no app with id is present',

      function (done) {

        request
          .get('/apps/' + randomId())
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


  describe('POST /apps/:aid/invite', function () {

    var testUrl;

    before(function (done) {
      testUrl = '/apps/' + saved.apps.first._id + '/invite';
      logoutUser(done);
    });

    it('should return error if not logged in',

      function (done) {

        request
          .post(testUrl)
          .send({})
          .expect('Content-Type', /json/)
          .expect(401)
          .end(done);

      });


    it('logging in user', function (done) {
      loginUser(done);
    });


    it('should create and send new invite',

      function (done) {

        var newInvite = {
          name: 'Prats',
          email: 'prattbhatt@gmail.com'
        };

        request
          .post(testUrl)
          .send(newInvite)
          .set('cookie', loginCookie)
          .expect('Content-Type', /json/)
          .expect(201)
          .end(function (err, res) {

            expect(res.body)
              .to.be.an("object");

            expect(res.body)
              .to.have.property("toEmail", newInvite.email);

            expect(res.body)
              .to.have.property("toName", newInvite.name);

            done(err);
          });

      });

  });


  describe('GET /apps/:aid/invite/:inviteId', function () {

    var testUrl;
    var testInvite;

    before(function (done) {
      testInvite = saved.invites.first;
      testUrl = '/apps/' + saved.apps.first._id + '/invite/' +
        testInvite._id;
      logoutUser(done);
    });


    // NOTE: the saved invite has been created using the saved account.
    // Hence, it would not through the 'Create Account' error.
    it('should confirm invitation',

      function (done) {
        request
          .get(testUrl)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {

            expect(res.body)
              .to.be.an("object");

            expect(res.body)
              .to.have.property("message", 'REDIRECT_TO_LOGIN');

            expect(res.body)
              .to.have.property("success", true);

            done(err);
          });

      });


    // NOTE: the following test must be below the previous test, because we are checking
    // if the invite fixture has been deleted from the db after the confirmation
    // in the previous test
    it('should delete invite confirmed', function (done) {
      Invite.findById(testInvite._id, function (err, inv) {

        expect(err)
          .to.not.exist;

        expect(inv)
          .to.not.exist;

        done();
      })
    });


    it('should return error if the account is already in the team',

      function (done) {

        var inviteId;

        var testUrl = '/apps/' + saved.apps.first._id + '/invite/';

        Invite.create(

          {
            aid: saved.apps.first._id,
            from: saved.accounts.second._id,
            toEmail: saved.accounts.first.email,
            toName: 'Random Name'
          },

          function (err, inv) {

            if (err) return done(err);
            inviteId = inv._id;
            testUrl = testUrl + inviteId;

            request
              .get(testUrl)
              .expect('Content-Type', /json/)
              .expect(200)
              .end(function (err, res) {

                expect(res.body)
                  .to.be.an("object");

                expect(res.body)
                  .to.have.property("message", 'IS_TEAM_MEMBER');

                expect(res.body)
                  .to.have.property("success", false);

                done(err);
              });

          });


      });


    it('should return error if invite not found',
      function (done) {

        var testUrl = '/apps/' + saved.apps.first._id + '/invite/' +
          randomId();

        request
          .get(testUrl)
          .expect('Content-Type', /json/)
          .expect(404)
          .end(function (err, res) {

            expect(res.body)
              .to.be.an("object");

            expect(res.body)
              .to.have.property("message", 'INVITE_NOT_FOUND');

            expect(res.body)
              .to.have.property("success", false);

            done(err);
          });

      });


  });

});
