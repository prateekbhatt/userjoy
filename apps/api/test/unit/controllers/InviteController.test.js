describe('Resource /apps/:aid/invites', function () {

  /**
   * npm dependencies
   */

  var mongoose = require('mongoose');
  var randomId = mongoose.Types.ObjectId;


  /**
   * Models
   */

  var Invite = require('../../../api/models/Invite');



  before(function (done) {
    setupTestDb(done);
  });


  describe('GET /apps/:aid/invites', function () {

    var testUrl;
    var testInvite;

    before(function (done) {
      testInvite = saved.invites.first;
      testUrl = '/apps/' + saved.apps.first._id + '/invites/';
      logoutUser(done);
    });

    it('should return error if not logged in',

      function (done) {

        request
          .get(testUrl)
          .expect('Content-Type', /json/)
          .expect(401)
          .end(done);

      });


    it('logging in user', function (done) {
      loginUser(done);
    });


    it('should return all invites belonging to an app', function (done) {

      request
        .get(testUrl)
        .set('cookie', loginCookie)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          console.log(res.body);

          expect(res.body)
            .to.be.an("array");

          expect(res.body)
            .to.not.be.empty;

          expect(res.body[0])
            .to.have.property("toName");

          expect(res.body[0])
            .to.have.property("toEmail");

          expect(res.body[0])
            .to.have.property("from");

          expect(res.body[0])
            .to.have.property("aid");

          done(err);
        });

    });


  });


  describe('POST /apps/:aid/invites', function () {

    var testUrl;

    before(function (done) {
      testUrl = '/apps/' + saved.apps.first._id + '/invites';
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

            expect(err)
              .to.not.exist;

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


  describe('GET /apps/:aid/invites/:inviteId', function () {

    var testUrl;
    var testInvite;

    before(function (done) {
      testInvite = saved.invites.first;
      testUrl = '/apps/' + saved.apps.first._id + '/invites/' +
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


    it(
      'should return error and delete invite, if the account is already in the team',

      function (done) {

        var inviteId;

        var testUrl = '/apps/' + saved.apps.first._id + '/invites/';

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

                Invite.findById(inviteId, function (err, deletedInv) {

                  expect(err)
                    .to.not.exist;

                  expect(deletedInv)
                    .to.not.exist;

                  done();
                });

              });

          });


      });


    it('should return error if invite not found',
      function (done) {

        var testUrl = '/apps/' + saved.apps.first._id + '/invites/' +
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
