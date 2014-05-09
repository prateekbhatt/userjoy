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

    it('should return error if aid/name/type/uid is not given',
      function (done) {

        var newEvent = {};

        Event.create(newEvent, function (err, evn) {

          expect(evn)
            .to.not.exist;

          expect(Object.keys(err.errors)
            .length)
            .to.eql(4);

          expect(err.errors.aid.message)
            .to.eql('Invalid aid');

          expect(err.errors.name.message)
            .to.eql('Invalid event name');

          expect(err.errors.uid.message)
            .to.eql('Invalid uid');

          expect(err.errors.type.message)
            .to.eql('Event type is required');

          done();
        });

      });


    it('should return error when valid type is not given',
      function (done) {

        var newEvent = {
          aid: randomId,
          name: 'Create App',
          type: 'randomType',
          uid: randomId
        };

        Event.create(newEvent, function (err, evn) {

          expect(evn)
            .to.not.exist;

          expect(err.errors.type.message)
            .to.eql("Event type must be one of 'pageview' or 'feature'");

          done();
        });

      });


    it('should create event',
      function (done) {

        var newEvent = {
          aid: randomId,
          name: 'Create Action',
          type: 'feature',
          uid: randomId,
          meta: [{
            k: 'status',
            v: 'paying'
          }]
        };

        Event.create(newEvent, function (err, evn) {

          expect(err)
            .to.not.exist;

          expect(evn)
            .to.have.property("type", "feature");

          savedEvent = evn;

          done();
        });

      });


    it('should add ct (created) timestamp to new event', function () {
      expect(savedEvent)
        .to.have.property('ct');
    });


    it('should add event metadata', function () {
      expect(savedEvent.meta)
        .to.be.an("array");

      expect(savedEvent.meta)
        .to.have.length(1);

      expect(savedEvent.meta[0])
        .to.have.property("k", "status");
    });

  });


  describe('#feature', function () {

    it('should return error if less than 5 arguments are passed',
      function () {

        expect(Event.feature)
          .to.
        throw ('Event.feature: Expected five arguments');

      });

    it('should create a new feature event', function (done) {

      var ids = {
        uid: randomId,
        aid: randomId
      };

      var name = 'Open chat';
      var feature = 'Group';

      var meta = {
        members: 99
      };

      Event.feature(ids, name, feature, meta, function (err, evn) {

        evn = evn.toJSON();

        expect(err)
          .to.not.exist;

        expect(evn.meta)
          .to.be.an("array");

        expect(evn.meta)
          .to.have.length(1);

        expect(evn)
          .to.have.property("type", "feature");

        expect(evn)
          .to.have.property("name", "Open chat");

        expect(evn)
          .to.have.property("feature", "Group");

        expect(evn.meta)
          .to.eql([{
            k: 'members',
            v: 99
          }]);

        done();
      });
    });

  });


  describe('#pageview', function () {

    it('should create a new pageview event', function (done) {

      var ids = {
        uid: randomId,
        aid: randomId
      };

      var name = '/login';

      Event.pageview(ids, name, function (err, evn) {

        evn = evn.toJSON();

        expect(err)
          .to.not.exist;

        expect(evn.meta)
          .to.be.an("array");

        expect(evn)
          .to.have.property("type", "pageview");

        expect(evn)
          .to.have.property("name", "/login");

        done();
      });
    });

  });

});
