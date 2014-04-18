describe('Model Company', function () {


  /**
   * Models
   */

  var Company = require('../../../api/models/Company');


  /**
   * Test variables
   */

  var randomId = '532d6bf862d673ba7131812a';
  var savedCompany;


  describe('#create', function () {
    it('should create company', function (done) {

      var newCompany = {
        name: 'Do Data Do 2',
        aid: randomId
      };

      Company.create(newCompany, function (err, com) {
        expect(err)
          .to.not.exist;
        expect(com)
          .to.be.an('object');

        savedCompany = com;

        expect(com.name)
          .to.eql(newCompany.name);
        done();
      });

    });

    it('should not add ct unless passed', function () {
      expect(savedCompany)
        .not.to.have.property('ct');
    });

  });


  describe('#getOrCreate', function () {

    var newCompany = {
      name: 'BlaBlaCar'
    };

    before(function (done) {
      newCompany.aid = randomId;
      Company.create(newCompany, done);
    });

    it('should return company if company exists', function (done) {
      Company.getOrCreate(randomId, newCompany, function (err, com) {

        expect(err)
          .to.not.exist;
        expect(com)
          .to.be.ok;
        expect(com.name)
          .to.eql(newCompany.name);
        done();
      });
    });

    it('should create company if company does not exist', function (done) {

      var newCompany = {
        name: 'Do Data Do'
      };

      Company.getOrCreate(randomId, newCompany, function (err, com) {
        // TODO: this test needs to be updated, it only needs to check if
        // User.create is called with the right params (using sinon.spy)
        expect(err)
          .to.not.exist;
        expect(com)
          .to.be.ok;
        expect(com.name)
          .to.eql(newCompany.name);
        done();
      });

    });

    it('should throw error if any argument is missing', function (done) {

      var testFunc = function () {
        Company.getOrCreate({}, function () {});
      };

      expect(testFunc)
        .to.
      throw ('undefined is not a function');
      done();
    });

    it(
      'should return error if company_id and name are missing from company',
      function (done) {

        var testCompany = {
          status: 'blabla'
        };

        Company.getOrCreate(randomId, testCompany, function (err, com) {
          expect(err)
            .to.exist;
          expect(err.message)
            .to.eql('Please send company_id or name to identify company');
          done();
        });
      });

    it('should store billing data if billing data object is present',
      function (done) {

        var testCompany = {
          name: 'NEW_COMPANY'
        };

        var billing = {
          status: 'paying',
          plan: 'Basic',
          currency: 'USD'
        };

        testCompany.billing = billing;

        Company.getOrCreate(randomId, testCompany, function (err, com) {
          expect(err)
            .not.to.exist;

          expect(com)
            .to.be.an('object');

          expect(com.name)
            .to.eql(testCompany.name);

          expect(com.billing.status)
            .to.eql(billing.status);

          done();
        });
      });


    it(
      'should return error if billing status is neither of [trial, free, paying, cancelled]',
      function (done) {

        var testCompany = {
          name: 'NEW_COMPANY_ANOTHER'
        };

        var billing = {
          status: 'randomStatus',
          plan: 'Basic',
          currency: 'USD'
        };

        testCompany.billing = billing;

        Company.getOrCreate(randomId, testCompany, function (err, com) {

          expect(err)
            .to.exist;

          expect(err.message)
            .to.eql(
              "Billing status must be one of 'trial', 'free', 'paying' or 'cancelled'"
          );

          done();
        });
      });
  });

});
