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

    it('should add testKey and liveKey to app', function () {
      expect(saved.apps.first)
        .to.have.property("testKey");
      expect(saved.apps.first)
        .to.have.property("liveKey");
    });


    it('should add default color', function () {
      expect(saved.apps.first)
        .to.have.property("color", '#39B3D7');
    });


    it('should put the app in live mode by default', function () {
      expect(saved.apps.first)
        .to.have.property("live", true);
    });


    it('should add account to team and as admin', function () {

      var team = saved.apps.first.team;

      expect(team)
        .to.be.an("array");

      expect(team)
        .to.have.length(1);

      expect(team[0].accid)
        .to.eql(saved.accounts.first._id);

      expect(team[0].admin)
        .to.be.true;

    });

  });

  describe('#findByKey', function () {

    it('should fetch app using provided test key', function (done) {
      App.findByKey(saved.apps.first.testKey, function (err, app) {
        expect(err)
          .to.be.null;
        expect(app)
          .to.be.an("object");
        expect(app._id.toString())
          .to.eql(saved.apps.first._id.toString());
        done();
      });
    });

    it('should fetch app using provided live key', function (done) {
      App.findByKey(saved.apps.first.liveKey, function (err, app) {
        expect(err)
          .to.be.null;
        expect(app)
          .to.be.an("object");
        expect(app._id.toString())
          .to.eql(saved.apps.first._id.toString());
        done();
      });
    });


    it('should return error if key is invalid, no test_ / live_ prefix',
      function (done) {
        App.findByKey('random.testKey', function (err, app) {
          expect(err)
            .to.not.be.null;
          expect(err.message)
            .to.eql('Provide valid app key');
          done();
        });
      });


    it('should return error if no app with key was found',
      function (done) {
        App.findByKey('test_testKey', function (err, app) {
          expect(err)
            .to.be.null;
          expect(app)
            .to.be.null;
          done();
        });
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

  describe('#checkUrl', function () {

    var fetchedApp;

    before(function (done) {
      App.findByKey(saved.apps.first.liveKey, function (err, app) {
        fetchedApp = app;
        done(err);
      });
    });

    it('should throw error if no url is provided', function () {
      expect(fetchedApp.checkUrl)
        .to.
      throw ('Invalid Url');
    });

    it('should return false if url does not match', function () {
      expect(fetchedApp.checkUrl('blablarandom.com'))
        .to.be.false;
    });

    it('should return true if url matches stored url', function () {
      expect(fetchedApp.checkUrl(saved.apps.first.url))
        .to.be.true;
    });
  });


  describe('#addMember', function () {

    it('should add account to team', function (done) {

      var aid = saved.apps.first._id;
      var newMemberId = randomId();

      App.addMember(aid, newMemberId, function (err, app) {

        expect(err)
          .to.be.null;

        expect(app)
          .to.be.an("object");

        expect(app._id.toString())
          .to.eql(saved.apps.first._id.toString());


        var teamIds = _.pluck(app.team, 'accid');

        expect(teamIds)
          .to.not.be.empty;

        expect(teamIds)
          .to.contain(newMemberId);

        done();
      });
    });


    it('should return error if account is already a team member',
      function (done) {

        var aid = saved.apps.first._id;
        var adminId = saved.apps.first.team[0].accid;

        App.addMember(aid, adminId, function (err, app) {

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
});
