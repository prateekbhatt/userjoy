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

    it('should return error if aid/company_id/name not present',
      function (done) {
        var newCompany = {};

        Company.create(newCompany, function (err, com) {

          expect(err)
            .to.exist;

          expect(Object.keys(err.errors))
            .to.have.length(3);

          expect(com)
            .to.not.exist;

          expect(err.errors.name.message)
            .to.eql('INVALID_COMPANY_NAME');

          expect(err.errors.company_id.message)
            .to.eql('Invalid company id');

          expect(err.errors.aid.message)
            .to.eql('Path `aid` is required.');

          done();
        });

      });


    it('should create company', function (done) {

      var newCompany = {
        name: 'Do Data Do 2',
        company_id: '12345678',
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

        expect(com.company_id)
          .to.eql(newCompany.company_id);

        done();
      });

    });

    it('should not add ct unless passed', function () {
      expect(savedCompany)
        .not.to.have.property('ct');
    });

  });


  describe('#findOrCreate', function () {

    var newCompany = {
      name: 'BlaBlaCar',
      company_id: 'bla_bla_car',
      plan: 'enterprise',
      revenue: 399,
      status: 'free'
    };

    before(function (done) {
      newCompany.aid = randomId;
      Company.create(newCompany, done);
    });

    it('should return company if company exists', function (done) {
      Company.findOrCreate(randomId, newCompany, function (err, com) {

        expect(err)
          .to.not.exist;
        expect(com)
          .to.be.ok;
        expect(com.name)
          .to.eql(newCompany.name);

        expect(com)
          .to.have.property("plan")
          .that.is.a("string")
          .that.equals(newCompany.plan);

        expect(com)
          .to.have.property("revenue")
          .that.is.a("number")
          .that.equals(newCompany.revenue);

        expect(com)
          .to.have.property("status")
          .that.is.a("string")
          .that.equals(newCompany.status);

        done();
      });
    });

    it('should create company if company does not exist', function (done) {

      var newCompany = {
        name: 'Do Data Do',
        company_id: 'thisisarandomcompanyid??'
      };

      Company.findOrCreate(randomId, newCompany, function (err, com) {
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
        Company.findOrCreate({}, function () {});
      };

      expect(testFunc)
        .to.
      throw ('undefined is not a function');
      done();
    });

    it('should return error if company_id is missing from company',
      function (done) {

        var testCompany = {
          status: 'blabla'
        };

        Company.findOrCreate(randomId, testCompany, function (err, com) {
          expect(err)
            .to.exist;
          expect(err.message)
            .to.eql('NO_COMPANY_ID');
          done();
        });
      });



    it(
      'should return error if name is missing from company, company_id is present',
      function (done) {

        var testCompany = {
          status: 'trial',
          company_id: randomId
        };

        Company.findOrCreate(randomId, testCompany, function (err, com) {
          expect(err)
            .to.exist;
          expect(err.message)
            .to.eql('INVALID_COMPANY_NAME');
          done();
        });
      });


    it(
      'should return error if billing status is neither of [trial, free, paying, cancelled]',
      function (done) {

        var testCompany = {
          name: 'NEW_COMPANY_ANOTHER',
          company_id: 'anewcompanyid',
          status: 'randomStatus',
        };

        Company.findOrCreate(randomId, testCompany, function (err, com) {

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
