describe('Model Invite', function () {

  /**
   * npm dependencies
   */

  var mongoose = require('mongoose');


  /**
   * Models
   */

  var Invite = require('../../../api/models/Invite');


  /**
   * Test variables
   */

  var randomId = mongoose.Types.ObjectId;
  var savedInvite;


  describe('#create', function () {

    it(
      'should return error if aid/from/toEmail is not provided',
      function (done) {

        var newInv = {};

        Invite.create(newInv, function (err, inv) {

          expect(err)
            .to.exist;

          expect(Object.keys(err.errors)
            .length)
            .to.eql(3);

          expect(err.errors.aid.message)
            .to.eql('Invalid aid');

          expect(err.errors.from.message)
            .to.eql('Invalid from-account id');

          expect(err.errors.toEmail.message)
            .to.eql('Provide invitee email');

          expect(inv)
            .to.not.exist;

          done();
        })

      });


    it('should create invite', function (done) {

      var newInvite = {
        aid: randomId(),
        from: randomId(),
        toEmail: 'prattbhatt@gmail.com'
      };

      Invite.create(newInvite, function (err, inv) {

        expect(err)
          .to.not.exist;

        expect(inv)
          .to.be.an('object');

        savedInvite = inv;

        expect(inv)
          .to.have.property('aid', newInvite.aid);

        expect(inv)
          .to.have.property('from', newInvite.from);

        expect(inv)
          .to.have.property('toEmail', newInvite.toEmail);

        done();
      });

    });

    it('should add ct (created) timestamp', function () {

      expect(savedInvite)
        .to.have.property('ct');

    });


    it('should not add ut (updated) timestamp', function () {

      expect(savedInvite)
        .to.not.have.property('ut');

    });

  });


});
