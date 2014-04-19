describe('Model Message', function () {


  /**
   * Models
   */

  var Message = require('../../../api/models/Message');


  /**
   * Test variables
   */

  var randomId = '532d6bf862d673ba7131812a';
  var savedMessage;


  describe('#create', function () {

    it(
      'should return error if accid/aid/coId/from/text/type/uid is not provided',
      function (done) {

        var newCon = {};

        Message.create(newCon, function (err, msg) {

          expect(err)
            .to.exist;

          expect(Object.keys(err.errors)
            .length)
            .to.eql(7);

          expect(err.errors.accid.message)
            .to.eql('Invalid account id');

          expect(err.errors.aid.message)
            .to.eql('Invalid aid');

          expect(err.errors.coId.message)
            .to.eql('Invalid conversation id');

          expect(err.errors.from.message)
            .to.eql('Provide valid from type, either user/account');

          expect(err.errors.text.message)
            .to.eql('Provide message text');

          expect(err.errors.type.message)
            .to.eql('Provide message type');

          expect(err.errors.uid.message)
            .to.eql('Invalid uid');

          expect(msg)
            .to.not.exist;

          done();
        })

      });


    it('should create message', function (done) {

      var newMessage = {
        accid: randomId,
        aid: randomId,
        coId: randomId,
        from: 'user',
        text: 'Hello World',
        type: 'email',
        uid: randomId,
      };

      Message.create(newMessage, function (err, msg) {

        expect(err)
          .to.not.exist;

        expect(msg)
          .to.be.an('object');

        savedMessage = msg;

        expect(msg.aid.toString())
          .to.eql(newMessage.aid);

        expect(msg.text)
          .to.eql(newMessage.text);

        expect(msg.uid.toString())
          .to.eql(newMessage.uid);

        done();
      });

    });

    it('should add ct (created) timestamp', function () {

      expect(savedMessage)
        .to.have.property('ct');

    });


    it('should add ut (updated) timestamp', function () {

      expect(savedMessage)
        .to.have.property('ut');

    });


    it('should add clicked/replied/seen/sent values as false', function () {

      expect(savedMessage.clicked)
        .to.eql(false);

      expect(savedMessage.replied)
        .to.eql(false);

      expect(savedMessage.seen)
        .to.eql(false);

      expect(savedMessage.sent)
        .to.eql(false);

    });

  });


});
