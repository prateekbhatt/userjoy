describe('Model App', function () {


  /**
   * npm dependencies
   */

  var mongoose = require('mongoose');


  /**
   * models
   */

  var App = require('../../../api/models/App');


  /**
   * Test vars
   */

  var randomId = mongoose.Types.ObjectId;


  before(function (done) {
    setupTestDb(done);
  });

  describe('#create', function () {


    it('should add default color', function () {
      expect(saved.apps.first)
        .to.have.property("color", '#39B3D7');
    });

    it('should add default showMessageBox option as true', function () {
      expect(saved.apps.first)
        .to.have.property("showMessageBox", true);
    });

    it('should add account to team and as admin, also add username',
      function () {

        var team = saved.apps.first.team;

        expect(team)
          .to.be.an("array");

        expect(team)
          .to.have.length(1);

        expect(team[0].accid)
          .to.eql(saved.accounts.first._id);

        expect(team[0].admin)
          .to.be.true;

        expect(team[0].username)
          .to.be.a('string')
          .that.equals('prateek');

      });

    it(
      'should return error if name not provided, but not if subdomain is not provided',
      function (done) {

        var newApp = {};
        App.create(newApp, function (err, savedApp) {

          expect(err)
            .to.exist;

          expect(Object.keys(err.errors))
            .to.have.length(1);

          expect(err.errors.name.message)
            .to.eql('App name is required');

          expect(savedApp)
            .to.not.exist;

          done();
        })

      });


    it('should return error if subdomain is not unique', function (done) {

      var newApp = {
        name: saved.apps.first.name,
        subdomain: saved.apps.first.subdomain
      };

      App.create(newApp, function (err, savedApp) {

        expect(err)
          .to.exist;

        expect(err.name)
          .to.eql('MongoError');

        expect(err.code)
          .to.eql(11000);

        expect(_.contains(err.message, '$email'))
          .to.be.false;

        expect(savedApp)
          .to.not.exist;

        done();
      })

    });

  });


  describe('#findByAccountId', function () {

    it('should return all apps belonging to an account', function (done) {
      App.findByAccountId(saved.accounts.first._id, function (err, apps) {

        expect(err)
          .to.not.exist;

        expect(apps)
          .to.be.an("array")
          .and.to.not.be.empty;

        expect(apps[0].team)
          .to.be.an('array')
          .and.to.not.be.empty;

        expect(apps[0].team[0].accid)
          .to.have.property('_id');

        expect(apps[0].team[0].accid)
          .to.have.property('name');

        expect(apps[0].team[0].accid)
          .to.have.property('email');

        done();
      });
    });

  });


  describe('#queued', function () {

    var aid1;
    var aid2;
    var updateTime;

    before(function () {
      aid1 = saved.apps.first._id;
      aid2 = saved.apps.second._id;
      updateTime = new Date();
    });


    it('should update queuedUsage time', function (done) {

      async.series(

        [

          function callQueued(cb) {

            App.queued([aid1, aid2], 'usage', updateTime,
              function (err, n, raw) {

                expect(err)
                  .to.not.exist;

                expect(n)
                  .to.eql(2);

                expect(raw.updatedExisting)
                  .to.be.true;


                cb();
              });
          },

          function checkApp1(cb) {

            App
              .findById(aid1)
              .exec(function (err, app) {
                expect(err)
                  .to.not.exist;

                expect(app.queuedUsage)
                  .to.be.a('date')
                  .and.to.eql(updateTime);

                cb();
              });

          },

          function checkApp2(cb) {

            App
              .findById(aid2)
              .exec(function (err, app) {
                expect(err)
                  .to.not.exist;

                expect(app.queuedUsage)
                  .to.be.a('date')
                  .and.to.eql(updateTime);

                cb();
              });

          }

        ],

        done

      );

    });


    it('should update queuedScore time', function (done) {

      async.series(

        [

          function callQueued(cb) {

            App.queued(aid1, 'score', updateTime,
              function (err, n, raw) {

                expect(err)
                  .to.not.exist;

                expect(n)
                  .to.eql(1);

                expect(raw.updatedExisting)
                  .to.be.true;


                cb();
              });
          },

          function checkApp1(cb) {

            App
              .findById(aid1)
              .exec(function (err, app) {
                expect(err)
                  .to.not.exist;

                expect(app.queuedScore)
                  .to.be.a('date')
                  .and.to.eql(updateTime);

                cb();
              });

          }

        ],

        done

      );

    });

    it('should update queuedHealth time', function (done) {

      async.series(

        [

          function callQueued(cb) {

            App.queued(aid1, 'health', updateTime,
              function (err, n, raw) {

                expect(err)
                  .to.not.exist;

                expect(n)
                  .to.eql(1);

                expect(raw.updatedExisting)
                  .to.be.true;


                cb();
              });
          },

          function checkApp1(cb) {

            App
              .findById(aid1)
              .exec(function (err, app) {
                expect(err)
                  .to.not.exist;

                expect(app.queuedHealth)
                  .to.be.a('date')
                  .and.to.eql(updateTime);

                cb();
              });

          }

        ],

        done

      );

    });


  });


  describe('#addMember', function () {

    it('should add account to team', function (done) {

      var aid = saved.apps.first._id;
      var newMemberId = randomId();
      var newMemberName = 'RandOm Name';

      App.addMember(aid, newMemberId, newMemberName, function (err, app) {

        expect(err)
          .to.be.null;

        expect(app)
          .to.be.an("object");

        expect(app._id.toString())
          .to.eql(saved.apps.first._id.toString());


        var teamIds = _.pluck(app.team, 'accid');
        var teamUsernames = _.pluck(app.team, 'username');

        expect(teamIds)
          .to.contain(newMemberId);

        expect(teamUsernames)
          .to.contain('random');

        done();
      });
    });


    it('should return error if account is already a team member',
      function (done) {

        var aid = saved.apps.first._id;
        var adminId = saved.apps.first.team[0].accid;
        var adminName = 'somename';

        App.addMember(aid, adminId, adminName, function (err, app) {

          expect(err)
            .to.exist;

          expect(err.message)
            .to.eql('Is Team Member');

          expect(app)
            .to.not.exist;

        });

        done()
      });

  });


  describe('#usernameExists', function () {

    it('should return true if username exists', function () {
      var app = saved.apps.first;
      var existingUsername = app.team[0].username;

      var exists = app.usernameExists(existingUsername);
      expect(exists)
        .to.be.true;
    });


    it('should return false if username exists', function () {

      var app = saved.apps.first;
      var nonexistingUsername = 'randomrandom';

      var exists = app.usernameExists(nonexistingUsername);
      expect(exists)
        .to.be.false;
    });

  });


  describe('#getUsername', function () {

    it('should return username if it doesnot exist', function () {

      var app = saved.apps.first;
      var nonexistingUsername = 'randomrandom';

      var un = app.getUsername(nonexistingUsername);
      expect(un)
        .to.eql(nonexistingUsername);
    });


    it('should take firstName and lowercase it while generating username',
      function () {

        var app = saved.apps.first;
        var nonexistingUsername = 'RandOm Dandom';

        var un = app.getUsername(nonexistingUsername);
        expect(un)
          .to.eql('random');
      });


    it('should return append number to username to make it unique',
      function () {
        var app = saved.apps.first;
        var existingUsername = app.team[0].username;

        var un = app.getUsername(existingUsername);
        expect(un)
          .to.eql(existingUsername + '1');
      });

  });


  describe('#createDefaultApp', function () {

    it('should create default app for an account', function (done) {

      var accid = saved.accounts.first._id;
      var accName = 'Prateek Bhatt';

      App.createDefaultApp(accid, accName, function (err, defaultApp) {

        expect(err)
          .to.be.null;

        expect(defaultApp)
          .to.be.an("object");

        expect(defaultApp.name)
          .to.eql('YOUR COMPANY');

        var teamIds = _.pluck(defaultApp.team, 'accid');
        var teamUsernames = _.pluck(defaultApp.team, 'username');

        expect(teamIds)
          .to.contain(accid);

        // default app should not have subdomain, because subdomain has unique
        // and sparse indexes defined on it
        expect(defaultApp)
          .to.not.have.property('subdomain');

        expect(teamUsernames)
          .to.contain('prateek');

        done();
      });
    });


  });


});
