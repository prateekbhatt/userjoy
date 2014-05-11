describe('Service automessage', function () {

  var automessageService = require('../../../api/services/automessage');

  var randomId = '532d6bf862d673ba7131812a';
  var toName = 'prateek';
  var toEmail = 'prattbhatt@gmail.com';

  before(function (done) {
    setupTestDb(done);
  });

  describe('#getMailLocals', function () {

    var creator;
    var locals;
    var savedAutoMsg;

    beforeEach(function () {

      savedAutoMsg = saved.automessages.first.toJSON();

      // mongoose populate is run to populate the creator account
      creator = saved.accounts.first;
      savedAutoMsg.creator = creator;

      locals = automessageService._getMailLocals(savedAutoMsg, toName,
        toEmail);

    });


    it('should create locals object', function () {

      expect(locals)
        .to.have.property("fromEmail", creator.email);

      expect(locals)
        .to.have.property("fromName", creator.name);

      expect(locals)
        .to.have.property("toName", toName);

      expect(locals)
        .to.have.property("toEmail", toEmail);

      expect(locals)
        .to.have.property("text", savedAutoMsg.body);

      expect(locals)
        .to.have.property("subject", savedAutoMsg.sub);

      expect(locals)
        .to.have.property("replyToEmail", savedAutoMsg.aid + '@mail.userjoy.co');

      expect(locals)
        .to.have.property("replyToName", 'Reply to ' + creator.name);

    });


    it('should automessage-id in metadata', function () {

      expect(locals.metadata)
        .to.have.property("amId", savedAutoMsg._id);

    });

  });


  describe('()', function () {

    var creator;
    var locals;
    var savedAutoMsg;
    var to = [{
      name: toName,
      email: toEmail
    }];

    beforeEach(function () {

      savedAutoMsg = saved.automessages.first.toJSON();

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
