describe('Worker automessagePublisher', function () {


  /**
   * npm dependencies
   */

  var moment = require('moment');
  var mongoose = require('mongoose');


  /**
   * Models
   */

  var AutoMessage = require('../../api/models/AutoMessage');


  /**
   * Workers
   */

  var worker = require('../../workers/automessagePublisher');


  /**
   * Test variables
   */

  var randomId = mongoose.Types.ObjectId;


  before(function (done) {
    setupTestDb(done);
  });


  describe('#findAutoMessages', function () {

    function createAM(cb) {

      var newAM = {
        aid: randomId(),
        body: 'Hey, Welkom to CabanaLand!',
        creator: randomId(),
        sid: randomId(),
        sub: 'Welkom!',
        title: 'Welcome Message',
        type: 'email'
      };

      newAM.active = true;
      newAM.lastQueued = moment()
        .subtract('hours', 10)
        .unix();

      AutoMessage.create(newAM, cb);
    }


    before(function (done) {

      var count = 0;

      async.whilst(

        function () {
          return count < 10;
        },

        function (callback) {
          count++;

          setImmediate(function () {
            createAM(callback);
          });
        },

        done
      );

    });


    it('should return an array of automessage ids', function (done) {

      worker._findAutoMessages(function (err, ids) {
        expect(err)
          .to.not.exist;

        expect(ids)
          .to.be.an("array")
          .that.has.length(10);

        done();
      })


    });

  });


  describe('#queue', function () {

    it('should queue all automessages', function (done) {

      var msgs = [

        {
          _id: randomId()
        },

        {
          _id: randomId()
        }
      ];

      worker._queue(msgs, function (err, res) {
        expect(err)
          .to.not.exist;

        expect(res)
          .to.be.an("array")
          .that.has.length(2);

        done();
      });

    });

  });


});
