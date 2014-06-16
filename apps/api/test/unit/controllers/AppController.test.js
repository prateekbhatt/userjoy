describe('Resource /apps', function () {

  /**
   * npm dependencies
   */

  var mongoose = require('mongoose');


  /**
   * Models
   */

  var App = require('../../../api/models/App');
  var Segment = require('../../../api/models/Segment');


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

        var newApp = {
          name: 'My New App'
        };

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
            "App name is required"
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
            "Domain url is required"
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

        var newApp = {};

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
          .expect(200)
          .end(function (err, res) {

            if (err) return done(err);

            expect(res.body)
              .to.be.an("array");

            expect(res.body[0].team)
              .to.be.an("array");

            expect(res.body[0].team[0])
              .to.have.property("admin", true);

            expect(res.body[0].team[0].accid)
              .to.be.an("object");

            expect(res.body[0].team[0].accid)
              .to.have.property("_id");

            expect(res.body[0].team[0].accid)
              .to.have.property("name");

            expect(res.body[0].team[0].accid)
              .to.have.property("email");

            done();
          });

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

            expect(res.body.team[0])
              .to.have.property("accid")
              .that.is.an("object")
              .and.has.keys(['_id', 'name', 'email'])
              .and.has.property('_id', saved.accounts.first._id.toString());

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


  describe('POST /apps/:aid/send-code-to-developer', function () {

    var url;
    var sendToEmail = 'prattbhatt@gmail.com';

    before(function (done) {
      logoutUser(done);
      url = '/apps/' + saved.apps.first._id + '/send-code-to-developer';
    });

    it('returns error if not logged in',

      function (done) {

        request
          .post(url)
          .send({
            email: sendToEmail
          })
          .expect('Content-Type', /json/)
          .expect(401)
          .end(done);

      });


    it('logging in user', function (done) {
      loginUser(done);
    });


    it('should send the installation code to developer',

      function (done) {

        request
          .post(url)
          .send({
            email: sendToEmail
          })
          .set('cookie', loginCookie)
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(function (res) {

            expect(res.body.message)
              .to.eql('Mail sent');

          })
          .end(done);

      });

  });


  describe('PUT /apps/:aid/color', function () {

    before(function (done) {
      logoutUser(done);
    });

    it('returns error if not logged in',

      function (done) {

        var newColor = '#FEFEFE';

        request
          .put('/apps/' + saved.apps.first._id + '/color')
          .send({
            color: newColor
          })
          .expect('Content-Type', /json/)
          .expect(401)
          .end(done);

      });


    it('logging in user', function (done) {
      loginUser(done);
    });


    it('should return error is invalid color code',

      function (done) {

        var newColor = '#FEFE';

        request
          .put('/apps/' + saved.apps.first._id + '/color')
          .send({
            color: newColor
          })
          .set('cookie', loginCookie)
          .expect('Content-Type', /json/)
          .expect(400)
          .expect({
            "error": "Provide valid color code",
            "status": 400
          })
          .end(done);

      });



    it('updates app name',

      function (done) {

        var newColor = '#FEFEFE';

        request
          .put('/apps/' + saved.apps.first._id + '/color')
          .send({
            color: newColor
          })
          .set('cookie', loginCookie)
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(function (res) {
            expect(res.body.color)
              .to.eql(newColor);
          })
          .end(done);

      });

  });


  describe('PUT /apps/:aid/activate', function () {

    var url;
    var aid;

    before(function (done) {
      logoutUser(done);
      aid = saved.apps.first._id;
      url = '/apps/' + aid + '/activate';
    });

    it('should return error if not logged in', function (done) {

      request
        .put(url)
        .expect('Content-Type', /json/)
        .expect(401)
        .end(done);

    });


    it('logging in user', function (done) {
      loginUser(done);
    });


    it('should activate app',

      function (done) {


        async.series([

          function shouldBeInActive(cb) {
            App.findById(aid, function (err, app) {
              expect(err)
                .to.not.exist;

              expect(app.isActive)
                .to.be.false;

              cb();
            })
          },


          function activateApp(cb) {

            request
              .put(url)
              .set('cookie', loginCookie)
              .expect('Content-Type', /json/)
              .expect(200)
              .expect(function (res) {
                expect(res.body.isActive)
                  .to.be.true;
              })
              .end(cb);
          },


          function shouldBeActive(cb) {

            App.findById(aid, function (err, app) {
              expect(err)
                .to.not.exist;

              expect(app.isActive)
                .to.be.true;

              cb();
            })

          },


          function shouldHaveCreatedPredefinedSegments(cb) {
            Segment.find({
              aid: aid
            })
              .exec(function (err, segs) {

                expect(err)
                  .to.not.exist;

                var preSegs = _.filter(segs, {
                  predefined: true
                });

                // expecting three health filters
                expect(preSegs.length)
                  .to.eql(3);

                cb();
              })
          }


        ], done);

      });

  });


});
