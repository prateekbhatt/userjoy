describe('Service automessage', function () {

  var automessageService = require('../../../api/services/automessage');

  var randomId = '532d6bf862d673ba7131812a';
  var toName = 'prateek';
  var toEmail = 'prattbhatt@gmail.com';

  before(function (done) {
    setupTestDb(done);
  });


  describe('#auto', function () {

    var creator;
    var locals;
    var savedAutoMsg;
    var savedManualMsg;
    var to = [{
      name: toName,
      email: toEmail
    }];

    beforeEach(function () {

      savedAutoMsg = saved.automessages.first.toJSON();
      savedManualMsg = saved.messages.first.toJSON();

    });


    it('should send automessage', function (done) {

      automessageService(savedAutoMsg.aid, savedAutoMsg._id, to,
        function (err) {

          expect(err)
            .to.not.exist;

          done();
        });

    });

  });

});
