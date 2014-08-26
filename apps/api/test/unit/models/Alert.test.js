describe('Model Alert', function () {


  /**
   * Models
   */

  var Alert = require('../../../api/models/Alert');


  /**
   * Test variables
   */

  var randomId = '532d6bf862d673ba7131812a';
  var savedAlert;


  before(function (done) {
    setupTestDb(done);
  });


  describe('#create', function () {

    it(
      'should return error if aid/sid is not provided',
      function (done) {

        var newAutoMsg = {};

        Alert.create(newAutoMsg, function (err, amsg) {

          expect(err)
            .to.exist;

          expect(Object.keys(err.errors)
            .length)
            .to.eql(2);

          expect(err.errors.aid.message)
            .to.eql('Invalid aid');

          expect(err.errors.sid.message)
            .to.eql('Invalid segment id');

          expect(amsg)
            .to.not.exist;

          done();
        })

      });


    it('should create alert', function (done) {

      var newAlert = {
        aid: randomId,
        body: 'Hey, Welkom to CabanaLand!',
        creator: randomId,
        sender: randomId,
        sid: randomId,
        sub: 'Welkom!',
        title: 'Welcome Message',
        type: 'email'
      };

      Alert.create(newAlert, function (err, msg) {

        expect(err)
          .to.not.exist;

        expect(msg)
          .to.be.an('object');

        savedAlert = msg;

        expect(msg.aid.toString())
          .to.eql(newAlert.aid);

        done();
      });

    });

    it('should add ct (created) timestamp', function () {

      expect(savedAlert)
        .to.have.property('ct');

    });


    it('should add ut (updated) timestamp', function () {

      expect(savedAlert)
        .to.have.property('ut');

    });


    it('should set active status to false by default', function () {
      expect(savedAlert)
        .to.have.property('active', false);
    });


  });



  describe('#updateLastQueued', function () {

    it('should should update lastQueued to current time', function (done) {

      var savedAlert = saved.alerts.first;

      expect(savedAlert)
        .to.not.have.property('lastQueued');

      Alert.updateLastQueued(savedAlert._id,
        function (err, msg) {

          expect(err)
            .to.not.exist;

          expect(msg)
            .to.be.an('object');

          expect(msg)
            .to.have.property("lastQueued");

          expect(msg.lastQueued)
            .to.be.a("date");

          done();
        });

    });

  });




});
