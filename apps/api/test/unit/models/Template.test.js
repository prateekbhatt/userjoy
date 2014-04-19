describe('Model Template', function () {


  /**
   * Models
   */

  var Template = require('../../../api/models/Template');


  /**
   * Test variables
   */

  var randomId = '532d6bf862d673ba7131812a';
  var savedTemplate;


  describe('#create', function () {

    it(
      'should return error if accid/aid/type is not provided',
      function (done) {

        var newTmp = {};

        Template.create(newTmp, function (err, tmp) {

          expect(err)
            .to.exist;

          expect(Object.keys(err.errors)
            .length)
            .to.eql(3);

          expect(err.errors.accid.message)
            .to.eql('Invalid account id');

          expect(err.errors.aid.message)
            .to.eql('Invalid aid');

          expect(err.errors.type.message)
            .to.eql('Provide template type');

          expect(tmp)
            .to.not.exist;

          done();
        })

      });


    it('should create template', function (done) {

      var newTemplate = {
        accid: randomId,
        aid: randomId,
        name: 'Hello World',
        type: 'email'
      };

      Template.create(newTemplate, function (err, tmp) {

        expect(err)
          .to.not.exist;

        expect(tmp)
          .to.be.an('object');

        savedTemplate = tmp;

        expect(tmp.aid.toString())
          .to.eql(newTemplate.aid);

        expect(tmp.accid.toString())
          .to.eql(newTemplate.accid);

        expect(tmp.type)
          .to.eql(newTemplate.type);

        expect(tmp.name)
          .to.eql(newTemplate.name);

        done();
      });

    });

    it('should add ct (created) timestamp', function () {

      expect(savedTemplate)
        .to.have.property('ct');

    });


    it('should add ut (updated) timestamp', function () {

      expect(savedTemplate)
        .to.have.property('ut');

    });


    it('should set clicked/replied/seen/sent values as 0', function () {

      expect(savedTemplate.clicked)
        .to.eql(0);

      expect(savedTemplate.replied)
        .to.eql(0);

      expect(savedTemplate.seen)
        .to.eql(0);

      expect(savedTemplate.sent)
        .to.eql(0);

    });

  });


});
