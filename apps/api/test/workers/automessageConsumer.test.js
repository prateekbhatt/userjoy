describe('Worker automessageConsumer', function () {


  /**
   * npm dependencies
   */

  var moment = require('moment');
  var mongoose = require('mongoose');


  /**
   * Models
   */

  var AutoMessage = require('../../api/models/AutoMessage');
  var Event = require('../../api/models/Event');
  var Notification = require('../../api/models/Notification');


  /**
   * Workers
   */

  var worker = require('../../workers/automessageConsumer');


  /**
   * Iron mq Queue
   */

  var queue = worker._queue;


  /**
   * Test variables
   */

  var randomId = mongoose.Types.ObjectId;


  before(function (done) {

    async.series([

      function (cb) {
        setupTestDb(cb);
      },


      function clearQueue(cb) {
        queue.clear(cb);
      },


      function createEvent(cb) {
        var aid = saved.automessages.first.aid;
        var uid = saved.users.first._id;

        var newEvent = {
          aid: aid,
          uid: uid,
          type: 'feature',
          name: 'Create Notification'
        };

        Event.create(newEvent, cb);
      }

    ], done);

  });

  describe('#amConsumer type:email', function () {

    var amId;

    before(function (cb) {
      amId = saved.automessages.first._id.toString();

      // queue auto message
      queue.post(amId, cb);
    });


    it('should fetch amId and send automessages', function (done) {

      worker._amConsumer(function (err, queueId, automessage) {

        expect(err)
          .to.not.exist;

        expect(queueId)
          .to.be.a("string")
          .that.is.not.empty;

        expect(automessage)
          .to.be.an("object")
          .that.is.not.empty;

        done();
      });

    });


    it('should create new automessage queue event', function (done) {

      var query = {
        type: 'automessage',
        meta: {
          $all: [

            {
              $elemMatch: {
                k: 'amId',
                v: amId.toString()
              }
            },

            {
              $elemMatch: {
                k: 'state',
                v: 'queued'
              }
            }

          ]
        }
      };

      Event
        .find(query)
        .exec(function (err, evn) {

          expect(err)
            .to.not.exist;

          expect(evn)
            .to.be.an('array')
            .that.has.length(1);

          expect(evn[0])
            .to.have.property('meta')
            .that.is.an('array');

          done();
        });

    });



  });


  describe('#amConsumer type:notification', function () {

    var amId;

    before(function (cb) {

      amId = saved.automessages.second._id.toString();

      // queue auto message
      queue.post(amId, cb);
    });

    it('should fetch amId and send automessages', function (done) {

      worker._amConsumer(function (err, queueId, automessage) {

        expect(err)
          .to.not.exist;

        expect(queueId)
          .to.be.a("string")
          .that.is.not.empty;

        expect(automessage)
          .to.be.an("object")
          .that.is.not.empty;

        done();
      });

    });


    it('should create new automessage queue event', function (done) {

      var query = {
        type: 'automessage',
        meta: {
          $all: [

            {
              $elemMatch: {
                k: 'amId',
                v: amId.toString()
              }
            },

            {
              $elemMatch: {
                k: 'state',
                v: 'queued'
              }
            }

          ]
        }
      };

      Event
        .find(query)
        .exec(function (err, evn) {

          expect(err)
            .to.not.exist;

          expect(evn)
            .to.be.an('array')
            .that.has.length(1);

          expect(evn[0])
            .to.have.property('meta')
            .that.is.an('array');

          done();
        });

    });


    it('should create new notification to be shown to the user',
      function (done) {

        Notification
          .find({
            amId: amId
          })
          .exec(function (err, notf) {

            expect(err)
              .to.not.exist;

            expect(notf)
              .to.be.an("array")
              .that.has.length(1);

            expect(notf[0].amId.toString())
              .to.equal(amId.toString());

            expect(notf[0].body)
              .to.equal('Hey Prat, Welkom to Second CabanaLand!');

            done();
          });

      });

  });


});
