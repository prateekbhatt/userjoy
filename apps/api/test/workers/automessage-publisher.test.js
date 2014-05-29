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

  var worker = require('../../workers/automessage-publisher');


  /**
   * Test variables
   */

  var randomId = mongoose.Types.ObjectId;


  before(function (done) {
    setupTestDb(done);
  });

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

  describe('#findAutoMessages', function () {

    before(function (done) {

      var count = 0;

      async.whilst(

        function () {
          return count < 1;
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
          .that.has.length(1);

        done();
      })


    });

  });


// NOTE: the following test gets 3 automessages instead of 2 because an automessage
// is also created in the previous test case

  describe('#cronFunc', function () {

    before(function (done) {

      var count = 0;

      async.whilst(

        function () {
          return count < 2;
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


    it('should find and queue automessages', function (done) {

      worker._cronFunc(function (err, queueIds, ids, numberAffected) {

        expect(err)
          .to.not.exist;

        expect(queueIds)
          .to.be.an("array")
          .that.has.length(3);

        expect(ids)
          .to.be.an("array")
          .that.has.length(3);

        expect(numberAffected)
          .to.be.a("number")
          .that.equals(3);

        done();
      });

    });

  });


  describe('#updateLastQueued', function () {


    it('should update lastQueued time', function (done) {

      var savedAMId = saved.automessages.first._id.toString();
      var savedAMId2 = saved.automessages.second._id.toString();
      var ids = [savedAMId, savedAMId2];

      worker._updateLastQueued(ids, function (err, numberAffected) {

        expect(err)
          .to.not.exist;

        expect(numberAffected)
          .to.be.a("number")
          .that.equals(2);

        done();
      });

    });

  });


});
