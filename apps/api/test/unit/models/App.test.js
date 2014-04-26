describe('Model App', function () {

  var App = require('../../../api/models/App');

  var randomId = '532d6bf862d673ba7131812a';

  before(function (done) {
    console.log('beforealllll');
    setupTestDb(done);
  });

  describe('#create', function () {

    it('should add testKey and liveKey to app', function () {
      expect(saved.apps.first)
        .to.have.property("testKey");
      expect(saved.apps.first)
        .to.have.property("liveKey");
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
      App.findByKey('test', saved.apps.first.testKey, function (err, app) {
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
      App.findByKey('live', saved.apps.first.liveKey, function (err, app) {
        expect(err)
          .to.be.null;
        expect(app)
          .to.be.an("object");
        expect(app._id.toString())
          .to.eql(saved.apps.first._id.toString());
        done();
      });
    });


    it('should return null if key does not exist', function (done) {
      App.findByKey('test', 'random.testKey', function (err, app) {
        expect(err)
          .to.be.null;
        expect(app)
          .to.be.null;
        done();
      });
    });

  });

  describe('#checkUrl', function () {

    var fetchedApp;

    before(function (done) {
      App.findByKey('live', saved.apps.first.liveKey, function (err, app) {
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
});
