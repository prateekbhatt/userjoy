describe('Model AutoMessage', function () {


  /**
   * Models
   */

  var AutoMessage = require('../../../api/models/AutoMessage');


  /**
   * Test variables
   */

  var randomId = '532d6bf862d673ba7131812a';
  var savedAutoMessage;


  describe('#create', function () {

    it('should return error if creator/aid/type is not provided',
      function (done) {

        var newAutoMsg = {};

        AutoMessage.create(newAutoMsg, function (err, amsg) {

          expect(err)
            .to.exist;

          expect(Object.keys(err.errors)
            .length)
            .to.eql(3);

          expect(err.errors.creator.message)
            .to.eql('Invalid creator account id');

          expect(err.errors.aid.message)
            .to.eql('Invalid aid');

          expect(err.errors.type.message)
            .to.eql('Provide automessage type');

          expect(amsg)
            .to.not.exist;

          done();
        })

      });


    it('should create automessage', function (done) {

      var newAutoMessage = {
        creator: randomId,
        aid: randomId,
        name: 'Hello World',
        type: 'email'
      };

      AutoMessage.create(newAutoMessage, function (err, amsg) {

        expect(err)
          .to.not.exist;

        expect(amsg)
          .to.be.an('object');

        savedAutoMessage = amsg;

        expect(amsg.aid.toString())
          .to.eql(newAutoMessage.aid);

        expect(amsg.creator.toString())
          .to.eql(newAutoMessage.creator);

        expect(amsg.type)
          .to.eql(newAutoMessage.type);

        expect(amsg.name)
          .to.eql(newAutoMessage.name);

        done();
      });

    });

    it('should add ct (created) timestamp', function () {

      expect(savedAutoMessage)
        .to.have.property('ct');

    });


    it('should add ut (updated) timestamp', function () {

      expect(savedAutoMessage)
        .to.have.property('ut');

    });


    it('should set clicked/replied/seen/sent values as 0', function () {

      expect(savedAutoMessage.clicked)
        .to.eql(0);

      expect(savedAutoMessage.replied)
        .to.eql(0);

      expect(savedAutoMessage.seen)
        .to.eql(0);

      expect(savedAutoMessage.sent)
        .to.eql(0);

    });

  });


});
