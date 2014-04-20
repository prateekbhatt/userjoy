describe('Model Invite', function () {


  /**
   * Models
   */

  var Invite = require('../../../api/models/Invite');


  /**
   * Test variables
   */

  var randomId = '532d6bf862d673ba7131812a';
  var savedInvite;


  describe('#create', function () {

    it(
      'should return error if aid/from/to is not provided',
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

          expect(err.errors.to.message)
            .to.eql('Provide email');

          expect(inv)
            .to.not.exist;

          done();
        })

      });


    it('should create invite', function (done) {

      var newInvite = {
        aid: randomId,
        from: randomId,
        to: 'randomId@random.com'
      };

      Invite.create(newInvite, function (err, inv) {

        expect(err)
          .to.not.exist;

        expect(inv)
          .to.be.an('object');

        savedInvite = inv;

        expect(inv.aid.toString())
          .to.eql(newInvite.aid);

        expect(inv.from.toString())
          .to.eql(newInvite.from);

        expect(inv.to)
          .to.eql(newInvite.to);

        done();
      });

    });

    it('should add ct (created) timestamp', function () {

      expect(savedInvite)
        .to.have.property('ct');

    });


    it('should add ut (updated) timestamp', function () {

      expect(savedInvite)
        .to.have.property('ut');

    });


    it('should set status as pending', function () {

      expect(savedInvite.status)
        .to.eql('pending');

    });

  });


});
