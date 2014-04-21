describe('Model Health', function () {


  /**
   * Models
   */

  var Health = require('../../../api/models/Health');


  /**
   * Test variables
   */

  var randomId = '532d6bf862d673ba7131812a';
  var savedHealth;


  describe('#create', function () {

    it(
      'should return error if aid/h/uid is not provided',
      function (done) {

        var newInv = {};

        Health.create(newInv, function (err, hs) {

          expect(err)
            .to.exist;

          expect(Object.keys(err.errors)
            .length)
            .to.eql(3);

          expect(err.errors.aid.message)
            .to.eql('Invalid aid');

          expect(err.errors.h.message)
            .to.eql('Invalid health score');

          expect(err.errors.uid.message)
            .to.eql('Invalid user id');

          expect(hs)
            .to.not.exist;

          done();
        })

      });


    it('should create health', function (done) {

      var newHealth = {
        aid: randomId,
        h: 34,
        uid: randomId
      };

      Health.create(newHealth, function (err, hs) {

        expect(err)
          .to.not.exist;

        expect(hs)
          .to.be.an('object');

        savedHealth = hs;

        expect(hs.aid.toString())
          .to.eql(newHealth.aid);

        expect(hs.uid.toString())
          .to.eql(newHealth.uid);

        expect(hs.h)
          .to.eql(newHealth.h);

        done();
      });

    });

    it('should add ct (created) timestamp', function () {

      expect(savedHealth)
        .to.have.property('ct');

    });


    it('should not add ut (updated) timestamp', function () {

      expect(savedHealth)
        .not.to.have.property('ut');

    });

  });


});
