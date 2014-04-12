describe.only('Lib query', function () {

  /**
   * Lib
   */

  var Query = require('../../../api/lib/query');


  /**
   * Models
   */

  var App = require('../../../api/models/App');
  var User = require('../../../api/models/User');


  /**
   * Test variables
   */

  var randomId = '532d6bf862d673ba7131812a';



  before(function (done) {
    setupTestDb(done)
  });



  describe('()', function () {

    var newQuery;
    var queryObj;
    var setIntoCountSpy;
    var setQueriesSpy;
    var filters = [{
      method: 'hasdone',
      name: 'Create new object'
    }];

    queryObj = {
      filters: filters
    };

    beforeEach(function () {
      setIntoCountSpy = sinon.spy(Query.prototype, 'setIntoCount');
      setQueriesSpy = sinon.spy(Query.prototype, 'setQueries');
      newQuery = new Query(saved.apps.first._id, queryObj);
    });

    afterEach(function () {
      Query.prototype.setIntoCount.restore();
      Query.prototype.setQueries.restore();
    });



    it('should set appId', function () {

      expect(newQuery.appId)
        .to.eql(saved.apps.first._id);
    });

    it('should set query', function () {

      expect(newQuery.query)
        .to.be.an('object');

      expect(newQuery.query)
        .to.eql(queryObj);
    });

    it('should set default startDate', function () {

      expect(newQuery.startDate)
        .to.exist;
    });


    it('should set default endDate', function () {

      expect(newQuery.endDate)
        .to.exist;
    });


    it('should call #setIntoCount', function () {

      expect(setIntoCountSpy)
        .to.have.been.calledOnce;

      expect(setIntoCountSpy)
        .to.have.been.calledWithExactly(filters);
    });


    it('should call #setQueries', function () {

      expect(setQueriesSpy)
        .to.have.been.calledOnce;

      expect(setQueriesSpy)
        .to.have.been.calledWithExactly(filters);
    });

  });


  describe('#setIntoCount', function () {

    var newQuery;
    var filters;
    var hasdoneIntoCountSpy;
    var hasnotdoneIntoCountSpy;


    beforeEach(function () {

      hasdoneIntoCountSpy = sinon.spy(Query.prototype,
        'hasdoneIntoCount');

      hasnotdoneIntoCountSpy = sinon.spy(Query.prototype,
        'hasnotdoneIntoCount');

    });

    afterEach(function () {
      Query.prototype.hasdoneIntoCount.restore();
      Query.prototype.hasnotdoneIntoCount.restore();
    })


    it('should not call hasdoneIntoCount if there is no hasdone filter',
      function () {

        filters = [{
          method: 'count',
          name: 'Create new chat',
          feature: 'Group',
          op: '$gt',
          val: 15
        }];

        Query.prototype.setIntoCount(filters);

        expect(hasdoneIntoCountSpy)
          .not.to.have.been.called;
      });

    it('should call hasdoneIntoCount if there is hasdone filter', function () {

      filters = [{
        method: 'count',
        name: 'Add member',
        feature: 'Group',
        op: '$gt',
        val: 15
      }, {
        method: 'hasdone',
        name: 'Create new chat'
      }, {
        method: 'hasdone',
        name: 'Create new group'
      }];

      Query.prototype.setIntoCount(filters);

      expect(hasdoneIntoCountSpy)
        .to.have.been.calledTwice;
    });

    it(
      'should not call hasnotdoneIntoCount if there is no hasnotdone filter',
      function () {


        filters = [{
          method: 'count',
          name: 'Create new chat',
          feature: 'Group',
          op: '$gt',
          val: 15
        }];

        Query.prototype.setIntoCount(filters);

        expect(hasnotdoneIntoCountSpy)
          .not.to.have.been.calledOnce;
      });

    it('should call hasnotdoneIntoCount if there is hasnotdone filter',
      function () {

        filters = [{
          method: 'count',
          name: 'Add member',
          feature: 'Group',
          op: '$gt',
          val: 15
        }, {
          method: 'hasdone',
          name: 'Create new chat'
        }, {
          method: 'hasnotdone',
          name: 'Create new group'
        }];

        Query.prototype.setIntoCount(filters);

        expect(hasnotdoneIntoCountSpy)
          .to.have.been.calledOnce;

        expect(hasnotdoneIntoCountSpy)
          .to.have.been.calledWithExactly(filters[2]);
      });

  });


  describe('#hasdoneIntoCount', function () {

    var hasdoneQuery = {
      method: 'hasdone',
      name: 'Create new chat'
    };

    before(function () {
      Query.prototype.hasdoneIntoCount(hasdoneQuery);
    });

    it('should update method property to count', function () {

      expect(hasdoneQuery.method)
        .to.eql('count');
    });

    it('should add val property to 0', function () {

      expect(hasdoneQuery.val)
        .to.eql(0);
    });

    it('should add op property as $gt', function () {

      expect(hasdoneQuery.op)
        .to.eql('$gt');
    });
  });


  describe('#hasnotdoneIntoCount', function () {

    var hndQuery = {
      method: 'hasnotdone',
      name: 'Create new chat'
    };

    before(function () {
      Query.prototype.hasnotdoneIntoCount(hndQuery);
    });

    it('should update method property to count', function () {

      expect(hndQuery.method)
        .to.eql('count');
    });

    it('should add val property to 0', function () {

      expect(hndQuery.val)
        .to.eql(0);
    });

    it('should add op property as $eq', function () {

      expect(hndQuery.op)
        .to.eql('$eq');
    });
  });


  describe('#setQueries', function () {


    it('should set countQueries', function () {

      var filters = [{
          method: 'count',
          name: 'Clicked login btn',
          op: '$eq',
          val: 0
        },

        {
          method: 'attr',
          name: 'platform',
          val: 'Android'
        }

      ];

      Query.prototype.setQueries(filters);

      expect(Query.prototype.countQueries)
        .to.be.an('array');

      expect(Query.prototype.countQueries.length)
        .to.eql(1);

    });


    it('should set attrQueries', function () {

      var filters = [{
          method: 'count',
          name: 'Clicked login btn',
          op: '$eq',
          val: 0
        },

        {
          method: 'attr',
          name: 'platform',
          val: 'Android'
        }

      ];

      Query.prototype.setQueries(filters);

      expect(Query.prototype.attrQueries)
        .to.be.an('array');

      expect(Query.prototype.attrQueries.length)
        .to.eql(1);

    });
  });


});
