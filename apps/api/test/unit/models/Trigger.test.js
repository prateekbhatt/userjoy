describe('Model Trigger', function () {


  /**
   * Models
   */

  var Trigger = require('../../../api/models/Trigger');


  /**
   * Test variables
   */

  var randomId = '532d6bf862d673ba7131812a';
  var savedTrigger;


  describe('#create', function () {

    it(
      'should return error if aid/creator/seId/tId is not provided',
      function (done) {

        var newCon = {};

        Trigger.create(newCon, function (err, trg) {

          expect(err)
            .to.exist;

          expect(Object.keys(err.errors)
            .length)
            .to.eql(4);

          expect(err.errors.aid.message)
            .to.eql('Invalid aid');

          expect(err.errors.creator.message)
            .to.eql('Invalid creator account id');

          expect(err.errors.seId.message)
            .to.eql('Invalid segment id');

          expect(err.errors.tId.message)
            .to.eql('Invalid template id');

          expect(trg)
            .to.not.exist;

          done();
        })

      });


    it('should create trigger', function (done) {

      var newTrigger = {
        aid: randomId,
        creator: randomId,
        seId: randomId,
        tId: randomId,
      };

      Trigger.create(newTrigger, function (err, trg) {

        expect(err)
          .to.not.exist;

        expect(trg)
          .to.be.an('object');

        savedTrigger = trg;

        expect(trg.aid.toString())
          .to.eql(newTrigger.aid);

        expect(trg.creator.toString())
          .to.eql(newTrigger.creator);

        expect(trg.seId.toString())
          .to.eql(newTrigger.seId);

        expect(trg.tId.toString())
          .to.eql(newTrigger.tId);

        done();
      });

    });

    it('should add ct (created) timestamp', function () {

      expect(savedTrigger)
        .to.have.property('ct');

    });


    it('should add ut (updated) timestamp', function () {

      expect(savedTrigger)
        .to.have.property('ut');

    });


    it('should add active value as true', function () {

      expect(savedTrigger.active)
        .to.eql(true);

    });

  });


});
