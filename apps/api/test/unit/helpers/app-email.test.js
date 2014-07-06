describe('Helper app-email', function () {

  var appEmail = require('../../../helpers/app-email');


  describe('#reply.create', function () {

    var input = {
      aid: '1234aid567',
      type: 'auto',
      messageId: 'abc12345'
    };

    var expectedOutput = '1234aid567+a_abc12345@test-mail.userjoy.co';

    it('should return the reply to email', function () {
      var a = appEmail.reply.create(input);
      expect(a)
        .to.eql(expectedOutput);
    });


    it('should throw error if three params not provided', function () {
      // no params
      expect(function () {
        appEmail.reply.create();
      })
        .to.
      throw ('aid/type/messageId expected');
    });


    it('should throw error if no/invalid type (not auto/manual)', function () {

      // no type
      expect(function () {
        appEmail.reply.create({
          aid: 'randomId',
          type: null,
          messageId: '1234'
        });
      })
        .to.
      throw ('type must be one of auto/manual');


      // invalid type
      expect(function () {
        appEmail.reply.create({
          aid: 'randomId',
          type: 'invalidType',
          messageId: 123131
        });
      })
        .to.
      throw ('type must be one of auto/manual');
    });

  });


  describe('#reply.parse', function () {

    var input = {
      aid: '1234aid567',
      type: 'auto',
      messageId: 'abc12345'
    };

    var expectedOutput = '1234aid567+a_abc12345@mail.userjoy.co';

    it('should return an object with type and messageId', function () {

      var a = appEmail.reply.parse(expectedOutput);
      expect(a)
        .to.be.an('object')
        .that.deep.equals(input);

    });


    it('should throw error if no input', function () {
      expect(function () {
        appEmail.reply.parse();
      })
        .to.
      throw ('provide valid email');
    });

  });


});
