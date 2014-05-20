describe('Resource /apps/:aid/usernotes', function () {

  /**
   * npm dependencies
   */

  var mongoose = require('mongoose');
  var randomId = mongoose.Types.ObjectId;


  /**
   * Models
   */

  var UserNote = require('../../../api/models/UserNote');



  before(function (done) {
    setupTestDb(done);
  });


  describe('GET /apps/:aid/users/:uid/notes', function () {

    var testUrl, uid, aid;
    var testUserNote;

    before(function (done) {
      testUserNote = saved.usernotes.first;
      aid = testUserNote.aid;
      uid = testUserNote.uid;

      testUrl = '/apps/' + aid + '/users/' + uid + '/notes/';
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


    it('should return all usernotes belonging to an app', function (done) {

      request
        .get(testUrl)
        .set('cookie', loginCookie)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {

          expect(res.body)
            .to.be.an("array")
            .and.to.not.be.empty;

          expect(res.body[0])
            .to.have.property("aid", aid.toString());

          expect(res.body[0])
            .to.have.property("creator");

          expect(res.body[0])
            .to.have.property("note");

          expect(res.body[0])
            .to.have.property("uid", uid.toString());

          done(err);
        });

    });


  });


  describe('POST /apps/:aid/users/:uid/notes', function () {

    var testUrl, uid, aid;
    var testUserNote;

    before(function (done) {
      testUserNote = saved.usernotes.first;
      aid = testUserNote.aid;
      uid = testUserNote.uid;

      testUrl = '/apps/' + aid + '/users/' + uid + '/notes/';
      logoutUser(done);
    });


    it('should return error if not logged in', function (done) {

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

    it('should return error if note not present',
      function (done) {

        request
          .post(testUrl)
          .send({})
          .set('cookie', loginCookie)
          .expect('Content-Type', /json/)
          .expect(400)
          .expect({
            error: ['note is required'],
            status: 400
          })
          .end(done);

      });


    it('should create note', function (done) {

      var newNote = {
        note: 'This is a new note about a user'
      };

      request
        .post(testUrl)
        .send(newNote)
        .set('cookie', loginCookie)
        .expect('Content-Type', /json/)
        .expect(201)
        .end(function (err, res) {

          if (err) return done(err);

          expect(res.body)
            .to.be.an("object")
            .and.to.not.be.empty;

          expect(res.body)
            .to.have.property("aid", aid.toString());

          expect(res.body)
            .to.have.property("creator");

          expect(res.body)
            .to.have.property("note", newNote.note);

          expect(res.body)
            .to.have.property("uid", uid.toString());

          done();
        });

    });


  });


describe('PUT /apps/:aid/users/:uid/notes/:nid', function () {

    var testUrl, uid, aid, nid;
    var testUserNote;

    before(function (done) {
      testUserNote = saved.usernotes.first;
      aid = testUserNote.aid;
      uid = testUserNote.uid;
      nid = testUserNote._id;

      testUrl = '/apps/' + aid + '/users/' + uid + '/notes/' + nid;
      logoutUser(done);
    });


    it('should return error if not logged in', function (done) {

      request
        .put(testUrl)
        .send({})
        .expect('Content-Type', /json/)
        .expect(401)
        .end(done);

    });


    it('logging in user', function (done) {
      loginUser(done);
    });

    it('should return error if note not present',
      function (done) {

        request
          .put(testUrl)
          .send({})
          .set('cookie', loginCookie)
          .expect('Content-Type', /json/)
          .expect(400)
          .expect({
            error: 'Provide a valid note',
            status: 400
          })
          .end(done);

      });


    it('should update note', function (done) {

      var updatedNote = {
        note: 'This is an updated note about a user'
      };

      request
        .put(testUrl)
        .send(updatedNote)
        .set('cookie', loginCookie)
        .expect('Content-Type', /json/)
        .expect(201)
        .end(function (err, res) {

          if (err) return done(err);

          expect(res.body)
            .to.be.an("object")
            .and.to.not.be.empty;

          expect(res.body)
            .to.have.property("aid", aid.toString());

          expect(res.body)
            .to.have.property("creator");

          expect(res.body)
            .to.have.property("note", updatedNote.note);

          expect(res.body)
            .to.have.property("uid", uid.toString());

          done();
        });

    });


  });





});
