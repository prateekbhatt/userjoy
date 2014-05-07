describe('Model Event', function () {


  /**
   * Models
   */

  var Event = require('../../../api/models/Event');


  /**
   * Test variables
   */

  var randomId = '532d6bf862d673ba7131812a';



  describe('#create', function () {

    var savedEvent;

    it('should return error if aid is not present', function (done) {

      var newEvent = {
        pl: 'Desktop',
        uid: randomId
      };

      Event.create(newEvent, function (err, evn) {
        expect(err)
          .to.exist;
        expect(err.errors.aid.message)
          .to.eql('Invalid aid');
        expect(evn)
          .not.to.exist;
        done();
      });
    });


    it('should return error if uid is not present', function (done) {

      var newEvent = {
        platform: 'Desktop',
        aid: randomId
      };

      Event.create(newEvent, function (err, evn) {
        expect(err)
          .to.exist;
        expect(err.errors.uid.message)
          .to.eql('Invalid uid');
        expect(evn)
          .not.to.exist;
        done();
      });
    });


    it('should return error when type is not given',
      function (done) {

        var newEvent = {
          aid: randomId,
          uid: randomId
        };

        Event.create(newEvent, function (err, evn) {

          expect(evn)
            .to.not.exist;

          expect(err.errors.t.message)
            .to.eql('Event type is required');

          done();
        });

      });


    it('should return error when valid type is not given',
      function (done) {

        var newEvent = {
          aid: randomId,
          t: 'randomType',
          uid: randomId
        };

        Event.create(newEvent, function (err, evn) {

          expect(evn)
            .to.not.exist;

          expect(err.errors.t.message)
            .to.eql("Event type must be one of 'pageview' or 'feature'");

          done();
        });

      });


    it('should create event',
      function (done) {

        var newEvent = {
          aid: randomId,
          t: 'feature',
          uid: randomId,
          d: [{
            k: 'status',
            v: 'paying'
          }]
        };

        Event.create(newEvent, function (err, evn) {

          expect(err)
            .to.not.exist;

          expect(evn)
            .to.have.property("t", "feature");

          savedEvent = evn;

          done();
        });

      });


    it('should add ct (created) timestamp to new event', function () {
      expect(savedEvent)
        .to.have.property('ct');
    });


    it('should add event data into "d" embedded document', function () {
      expect(savedEvent.d)
        .to.be.an("array");

      expect(savedEvent.d)
        .to.have.length(1);

      expect(savedEvent.d[0])
        .to.have.property("k", "status");
    });

  });


  describe('#feature', function () {

    it('should create a new feature event', function (done) {

      var ids = {
        uid: randomId,
        aid: randomId
      };

      var action = 'Open chat';
      var feature = 'Group';

      var meta = {
        members: 99
      };

      Event.feature(ids, action, feature, meta, function (err, evn) {

        evn = evn.toJSON();

        expect(err)
          .to.not.exist;

        expect(evn.d)
          .to.be.an("array");

        expect(evn.d)
          .to.have.length(3);

        expect(evn.d)
          .to.eql([{
            k: 'members',
            v: 99
          }, {
            k: 'action',
            v: 'Open chat'
          }, {
            k: 'feature',
            v: 'Group'
          }]);

        done(err);
      });
    });

  });


  describe('#pageview', function () {

    it('should create a new pageview event', function (done) {

      var ids = {
        uid: randomId,
        aid: randomId
      };

      var host = 'userjoy.co';
      var path = '/login';

      var meta = {
        members: 99
      };

      Event.pageview(ids, host, path, function (err, evn) {

        evn = evn.toJSON();

        expect(err)
          .to.not.exist;

        expect(evn.d)
          .to.be.an("array");

        expect(evn.d)
          .to.have.length(2);

        expect(evn.d)
          .to.eql([{
            k: 'host',
            v: 'userjoy.co'
          }, {
            k: 'path',
            v: '/login'
          }]);

        done(err);
      });
    });

  });

});
