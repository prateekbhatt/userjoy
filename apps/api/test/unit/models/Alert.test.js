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
      'should return error if aid/sid/title/when is not provided',
      function (done) {

        var newAlert = {};

        Alert.create(newAlert, function (err, alert) {

          expect(err)
            .to.exist;

          expect(Object.keys(err.errors)
            .length)
            .to.eql(4);

          expect(err.errors.aid.message)
            .to.eql('Invalid aid');

          expect(err.errors.sid.message)
            .to.eql('Invalid segment id');

          expect(err.errors.title.message)
            .to.eql("Provide alert title");

          expect(err.errors.when.message)
            .to.eql("Provide enters / leaves status");

          expect(alert)
            .to.not.exist;

          done();
        })

      });


    it('should create alert', function (done) {

      var newAlert = {
        aid: randomId,
        sid: randomId,
        title: 'New User',
        team: [randomId],
        when: 'enters'
      };

      Alert
        .create(newAlert, function (err, alert) {

          expect(err)
            .to.not.exist;

          expect(alert)
            .to.be.an('object');

          savedAlert = alert;

          expect(alert.aid.toString())
            .to.eql(newAlert.aid);

          expect(alert)
            .to.have.property('team')
            .that.is.an('array')
            .and.to.contain(randomId);

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
        function (err, alert) {

          expect(err)
            .to.not.exist;

          expect(alert)
            .to.be.an('object');

          expect(alert)
            .to.have.property("lastQueued");

          expect(alert.lastQueued)
            .to.be.a("date");

          done();
        });

    });

  });




});
