describe('Model App', function () {

  var App = require('../../../api/models/App');

  var randomId = '532d6bf862d673ba7131812a';

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

  describe('#checkDomain', function () {

    var fetchedApp;

    before(function (done) {
      App.findByKey('live', saved.apps.first.liveKey, function (err, app) {
        fetchedApp = app;
        done(err);
      });
    });

    it('should throw error if no domain is provided', function () {
      expect(fetchedApp.checkDomain)
        .to.
      throw ();
    });

    it('should return false if domain does not match', function () {
      expect(fetchedApp.checkDomain('blablarandom.com'))
        .to.be.false;
    });

    it('should return true if domain matches stored domain', function () {
      expect(fetchedApp.checkDomain(saved.apps.first.domain))
        .to.be.true;
    });
  });
});
