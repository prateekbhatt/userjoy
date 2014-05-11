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

    it(
      'should return error if aid/body/creator/sid/title/type is not provided',
      function (done) {

        var newAutoMsg = {};

        AutoMessage.create(newAutoMsg, function (err, amsg) {

          expect(err)
            .to.exist;

          expect(Object.keys(err.errors)
            .length)
            .to.eql(6);

          expect(err.errors.aid.message)
            .to.eql('Invalid aid');

          expect(err.errors.body.message)
            .to.eql('Provide automessage body');

          expect(err.errors.creator.message)
            .to.eql('Invalid creator account id');

          expect(err.errors.sid.message)
            .to.eql('Invalid segment id');

          expect(err.errors.title.message)
            .to.eql('Provide automessage title');

          expect(err.errors.type.message)
            .to.eql('Provide automessage type');

          expect(amsg)
            .to.not.exist;

          done();
        })

      });


    it('should create automessage', function (done) {

      var newAutoMessage = {
        aid: randomId,
        body: 'Hey, Welkom to CabanaLand!',
        creator: randomId,
        sid: randomId,
        sub: 'Welkom!',
        title: 'Welcome Message',
        type: 'email'
      };

      AutoMessage.create(newAutoMessage, function (err, msg) {

        expect(err)
          .to.not.exist;

        expect(msg)
          .to.be.an('object');

        savedAutoMessage = msg;

        expect(msg.aid.toString())
          .to.eql(newAutoMessage.aid);

        expect(msg.body)
          .to.eql(newAutoMessage.body);

        expect(msg.creator.toString())
          .to.eql(newAutoMessage.creator);

        expect(msg.sub)
          .to.eql(newAutoMessage.sub);

        expect(msg.title)
          .to.eql(newAutoMessage.title);

        expect(msg.type)
          .to.eql(newAutoMessage.type);

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


    it('should set active status to false by default', function () {
      expect(savedAutoMessage)
        .to.have.property('active', false);
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
