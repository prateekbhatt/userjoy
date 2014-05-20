describe('Resource /apps/:aid/users', function () {

  /**
   * npm dependencies
   */

  var mongoose = require('mongoose');

  var randomId = mongoose.Types.ObjectId;


  before(function (done) {
    setupTestDb(done);
  });


  describe('GET /apps/:aid/users/:uid', function () {

    var aid, uid, testUrl;

    before(function (done) {
      aid = saved.apps.first._id;
      uid = saved.users.first._id;
      testUrl = '/apps/' + aid + '/users/' + uid;
      logoutUser(done);
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


    it('fetches app with given id',

      function (done) {

        request
          .get(testUrl)
          .set('cookie', loginCookie)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {

            if (err) return done(err);

            expect(res.body)
              .to.have.property("_id", uid.toString());

            expect(res.body)
              .to.have.property("email");

            done();
          });

      });


    it('returns error if no user is found', function (done) {

      var testUrl = '/apps/' + aid + '/users/' + randomId();

      request
        .get(testUrl)
        .set('cookie', loginCookie)
        .expect('Content-Type', /json/)
        .expect(404)
        .expect({
          "error": "Not Found",
          "status": 404
        })
        .end(done);

    });
  });


  describe('GET /apps/:aid/users/:uid/conversations', function () {

    var aid, uid, testUrl;

    before(function (done) {
      aid = saved.apps.first._id;
      uid = saved.users.first._id;
      testUrl = '/apps/' + aid + '/users/' + uid + '/conversations';
      logoutUser(done);
    });


    it('should return error if not logged in', function (done) {

      request
        .get(testUrl)
        .expect('Content-Type', /json/)
        .expect(401)
        .end(done);
    });


    it('logging in user', function (done) {
      loginUser(done);
    });


    it('should return upto latest 10 conversations of user', function (
      done) {

      request
        .get(testUrl)
        .set('cookie', loginCookie)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {

          if (err) return done(err);

          expect(res.body)
            .to.be.an("array")
            .and.to.have.length.above(0);

          expect(res.body)
            .to.have.length.of.at.most(10);

          expect(res.body[0])
            .to.have.property('sub');

          expect(res.body[0])
            .to.have.property('toRead');

          expect(res.body[0])
            .to.have.property('closed');

          done();
        });

    });

  });

});
