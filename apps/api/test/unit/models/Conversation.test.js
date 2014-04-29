describe('Model Conversation', function () {


  /**
   * Models
   */

  var Conversation = require('../../../api/models/Conversation');


  /**
   * Test variables
   */

  var randomId = '532d6bf862d673ba7131812a';
  var savedConversation;


  describe('#create', function () {

    it('should return error if aid/sub/uid is not provided',
      function (done) {

        var newCon = {};

        Conversation.create(newCon, function (err, con) {

          expect(err)
            .to.exist;

          expect(Object.keys(err.errors)
            .length)
            .to.eql(3);

          expect(err.errors.uid.message)
            .to.eql('Invalid uid');

          expect(err.errors.aid.message)
            .to.eql('Invalid aid');

          expect(err.errors.sub.message)
            .to.eql('Provide subject');


          expect(con)
            .to.not.exist;

          done();
        })

      });


    it('should create conversation', function (done) {

      var newConversation = {
        aid: randomId,
        accId: randomId,
        sub: 'My new subject',
        uid: randomId
      };

      Conversation.create(newConversation, function (err, con) {

        expect(err)
          .to.not.exist;

        expect(con)
          .to.be.an('object');

        savedConversation = con;

        expect(con.aid.toString())
          .to.eql(newConversation.aid);

        expect(con.accId.toString())
          .to.eql(newConversation.accId);

        expect(con.sub)
          .to.eql(newConversation.sub);

        expect(con.uid.toString())
          .to.eql(newConversation.uid);

        done();
      });

    });

    it('should add ct (created) timestamp', function () {

      expect(savedConversation)
        .to.have.property('ct');

    });


    it('should add ut (updated) timestamp', function () {

      expect(savedConversation)
        .to.have.property('ut');

    });


    it('should add closed value as false', function () {

      expect(savedConversation)
        .to.have.property('closed');

      expect(savedConversation.closed)
        .to.eql(false);

    });

  });


});
