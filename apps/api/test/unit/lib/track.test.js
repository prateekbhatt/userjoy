describe('Lib track', function () {

  /**
   * Lib
   */

  var Event = require('../../../api/lib/track');


  /**
   * Models
   */

  var App = require('../../../api/models/App');
  var User = require('../../../api/models/User');


  /**
   * Test variables
   */

  var randomId = '532d6bf862d673ba7131812a';



  before(function (done) {
    setupTestDb(done)
  });

  var newEvent;

  var cookies = {
    'dodatado.uid': randomId,
    'dodatado.cid': randomId,
    'dodatado.sid': randomId
  };

  beforeEach(function () {
    newEvent = new Event({
      appKey: saved.apps.first.testKey,
      cookies: cookies
    });
  });

  describe('()', function () {

    it('should set mode', function () {
      expect(newEvent.mode)
        .to.eql('test');
    });

    it('should set ids from cookies', function () {
      expect(newEvent.uid)
        .to.eql(cookies['dodatado.uid']);
      expect(newEvent.sid)
        .to.eql(cookies['dodatado.sid']);
      expect(newEvent.cid)
        .to.eql(cookies['dodatado.cid']);
    });

  });


  describe('#_setMode', function () {

    it('should set .mode based on .appKey', function () {
      newEvent.appKey = saved.apps.first.liveKey;
      newEvent.mode = null;

      expect(newEvent.mode)
        .not.to.exist;

      newEvent._setMode();

      expect(newEvent.mode)
        .to.eql('live');
    });

  });


  describe('#_setIdsFromCookies', function () {

    it('should set .uid, .cid and .sid based on the cookies', function () {

      newEvent.uid = null;
      newEvent.cid = null;
      newEvent.sid = null;

      var cookies = {
        'dodatado.uid': 'randomUId',
        'dodatado.cid': 'randomCId',
        'dodatado.sid': 'randomSId'
      };

      expect(newEvent.uid)
        .to.be.null;
      expect(newEvent.sid)
        .to.be.null;
      expect(newEvent.cid)
        .to.be.null;

      newEvent._setIdsFromCookies(cookies);

      expect(newEvent.uid)
        .to.eql('randomUId');
      expect(newEvent.sid)
        .to.eql('randomSId');
      expect(newEvent.cid)
        .to.eql('randomCId');

    });
  });

  describe('#_findApp', function () {

    it('should return error if app not found', function (done) {

      newEvent.appKey = 'randomAppKey';

      newEvent._findApp(function (err, app) {

        expect(err)
          .to.exist;

        expect(err.message)
          .to.equal('App Not Found');

        expect(app)
          .not.to.exist;

        done();

      });
    });


    it('should set newEvent.app to found app', function (done) {

      before(function () {
        expect(newEvent.app)
          .not.to.exist;
      });

      newEvent._findApp(function (err, app) {

        expect(err)
          .not.to.exist;

        expect(newEvent.app)
          .to.be.an('object');

        done();

      });
    });

  });


  describe('#_verifyApp', function () {

    var newEvent;

    beforeEach(function (done) {

      newEvent = new Event({
        appKey: saved.apps.first.liveKey,
        cookies: {},
        url: 'randomUrl.com'
      });
      newEvent._findApp(done);
    });

    it('should call #checkUrl in live mode', function (done) {

      var spy = sinon.spy(App.prototype, 'checkUrl');

      newEvent._verifyApp(function (err) {
        expect(spy)
          .to.be.called;
        App.prototype.checkUrl.restore();
        done();
      });

    });

    it('should not call #checkUrl in test mode', function (done) {

      newEvent.mode = 'test';

      var spy = sinon.spy(App.prototype, 'checkUrl');

      newEvent._verifyApp(function (err) {
        expect(spy)
          .not.to.be.called;
        App.prototype.checkUrl.restore();
        done();
      });

    });

    it('should not return error in test mode', function (done) {

      newEvent.mode = 'test';

      newEvent._verifyApp(function (err) {

        expect(err)
          .not.to.exist;

        done();
      })

    });

    it('should return error if incorrect url in live mode',
      function (done) {

        newEvent._verifyApp(function (err) {

          expect(err)
            .to.exist;

          expect(err.message)
            .to.equal('Url Not Matching');

          done();

        });

      });


  });


  describe('#_checkOrCreateUser', function () {

    var spy;
    var demoEvent;


    before(function (done) {
      newEvent._findApp(function (err) {
        demoEvent = newEvent;
        done(err);
      });
    });

    // beforeEach(function () {
    //   spy = sinon.spy(User, 'findOrCreate');
    // });

    // afterEach(function () {
    //   User.findOrCreate.restore();
    // });

    it('should not call User.findOrCreate if uid exists',
      function (done) {

        spy = sinon.spy(User, 'findOrCreate');
        demoEvent.uid = 'randomUId';

        demoEvent._checkOrCreateUser(function (err) {
          expect(spy)
            .not.to.be.called;

          User.findOrCreate.restore();

          done();
        });

      });

    it('should call User.findOrCreate if uid does not exist',
      function (done) {

        spy = sinon.spy(User, 'findOrCreate');
        demoEvent.uid = null;

        demoEvent._checkOrCreateUser(function (err) {
          expect(spy)
            .to.be.called;

          expect(spy)
            .to.have.been.calledWith(demoEvent.app._id);

          User.findOrCreate.restore();

          done();
        });
      });


    it('should set .uid if uid does not exist and user saved without err',
      function (done) {

        demoEvent.uid = null;

        // user identifier needs to be present to save user
        demoEvent.user = {
          email: 'prateek@userjoy.co'
        };

        expect(demoEvent.uid)
          .not.to.exist;

        demoEvent._checkOrCreateUser(function (err) {

          expect(demoEvent.uid)
            .to.exist;

          done();
        });
      });
  });
});
