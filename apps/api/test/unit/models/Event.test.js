describe('Model Event', function () {


  /**
   * npm dependencies
   */

  var mongoose = require('mongoose');


  /**
   * Models
   */

  var Event = require('../../../api/models/Event');


  /**
   * Test variables
   */

  var randomId = mongoose.Types.ObjectId;



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
          aid: randomId(),
          name: 'Create App',
          type: 'randomType',
          uid: randomId()
        };

        Event.create(newEvent, function (err, evn) {

          expect(evn)
            .to.not.exist;

          expect(err.errors.type.message)
            .to.eql(
              "Event type must be one of 'auto/form/link/page/track'"
          );

          done();
        });

      });


    it('should create event',
      function (done) {

        var newEvent = {
          aid: randomId(),
          name: 'Create Action',
          type: 'track',
          uid: randomId(),
          meta: [{
            k: 'status',
            v: 'paying'
          }]
        };

        Event.create(newEvent, function (err, evn) {

          expect(err)
            .to.not.exist;

          expect(evn)
            .to.have.property("type", "track");

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


  describe('#track', function () {

    it('should return error if less than 5 arguments are passed',
      function () {

        expect(Event.track)
          .to.
        throw ('Event.track: Expected five arguments');

      });

    it('should create a new track event', function (done) {

      var ids = {
        uid: randomId(),
        aid: randomId()
      };

      var name = 'Open chat';
      var module = 'Group';

      var meta = {
        members: 99
      };

      Event.track(ids, name, module, meta, function (err, evn) {

        evn = evn.toJSON();

        expect(err)
          .to.not.exist;

        expect(evn.meta)
          .to.be.an("array");

        expect(evn.meta)
          .to.have.length(1);

        expect(evn)
          .to.have.property("type", "track");

        expect(evn)
          .to.have.property("name", "Open chat");

        expect(evn)
          .to.have.property("module", "Group");

        expect(evn.meta)
          .to.eql([{
            k: 'members',
            v: 99
          }]);

        done();
      });
    });

  });


  describe('#page', function () {

    it('should create a new pageview event', function (done) {

      var ids = {
        uid: randomId(),
        aid: randomId()
      };

      var name = '/login';

      Event.page(ids, name, function (err, evn) {

        evn = evn.toJSON();

        expect(err)
          .to.not.exist;

        expect(evn.meta)
          .to.be.an("array");

        expect(evn)
          .to.have.property("type", "page");

        expect(evn)
          .to.have.property("name", "/login");

        done();
      });
    });

  });


  describe('#automessage', function () {

    var ids = {
      uid: randomId(),
      aid: randomId(),
      amId: randomId()
    };
    var title = 'In App Welcome Message';
    var state = 'queued';
    it('should create a new automessage event', function (done) {

      var savedEventId;

      async.series({

        shouldCreateEvent: function (cb) {

          Event.automessage(ids, state, title, function (err, n, raw) {

            expect(err)
              .to.not.exist;

            expect(n)
              .to.eql(1);

            expect(raw.updatedExisting)
              .to.be.false;

            savedEventId = raw.upserted[0]._id;

            cb();

          });
        },


        checkTheEvent: function (cb) {

          Event
            .findById(savedEventId)
            .exec(function (err, evn) {
              expect(err)
                .to.not.exist;

              evn = evn.toJSON();

              expect(evn)
                .to.have.property("type", "auto");

              expect(evn)
                .to.have.property("name", "In App Welcome Message");

              expect(evn.meta[0])
                .to.eql({
                  k: 'amId',
                  v: ids.amId.toString()
                });

              expect(evn.meta[1])
                .to.eql({
                  k: 'state',
                  v: state
                });

              cb()
            })
        }

      }, done)

    });


    // MUST RUN AFTER THE ABOVE TEST
    it('should not create same automessage event twice', function (done) {

      Event.automessage(ids, state, title, function (err, n, raw) {

        expect(err)
          .to.not.exist;

        expect(n)
          .to.eql(1);

        expect(raw.updatedExisting)
          .to.be.true;

        expect(raw.upserted)
          .to.not.exist;

        done()
      });

    });


    it(
      'should return error if automessage state is not in queued/sent/clicked/opened/replied',
      function (done) {

        var ids = {
          uid: randomId(),
          aid: randomId(),
          amId: randomId()
        };

        var title = 'In App Welcome Message';
        var state = 'randomState';

        Event.automessage(ids, state, title, function (err, evn) {

          expect(err)
            .to.exist;

          expect(err.message)
            .to.eql(
              'automessage state must be one of queued/sent/opened/clicked/replied'
          );

          done();

        });
      });


    it(
      'should return error if aid/uid/amId not provided',
      function (done) {

        var ids = {
          uid: randomId(),
          aid: randomId(),
        };

        var title = 'In App Welcome Message';
        var state = 'sent';

        Event.automessage(ids, state, title, function (err, evn) {

          expect(err)
            .to.exist;

          expect(err.message)
            .to.eql('aid/uid/amId are required for automessage events');

          done();

        });
      });

  });

});
