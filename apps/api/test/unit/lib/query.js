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
   * Fixtures
   */

  var createUserFixtures = require('../../fixtureUser');
  var createSessionFixtures = require('../../fixtureSession');


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
    var setFiltersSpy;
    var filters = [{
      method: 'hasdone',
      name: 'Create new object'
    }];

    queryObj = {
      op: '$and',
      filters: filters
    };

    beforeEach(function () {
      setIntoCountSpy = sinon.spy(Query.prototype, 'setIntoCount');
      setFiltersSpy = sinon.spy(Query.prototype, 'setFilters');
      newQuery = new Query(saved.apps.first._id, queryObj);
    });

    afterEach(function () {
      Query.prototype.setIntoCount.restore();
      Query.prototype.setFilters.restore();
    });



    it('should set appId', function () {

      expect(newQuery.appId)
        .to.eql(saved.apps.first._id);
    });


    it('should set default startDate', function () {

      expect(newQuery.startDate)
        .to.exist;
    });


    it('should set default endDate', function () {

      expect(newQuery.endDate)
        .to.exist;
    });


    it('should set rootOperator', function () {

      expect(newQuery.rootOperator)
        .to.eql('$and');
    });


    it('should set default endDate', function () {

      expect(newQuery.countFilterUserIds)
        .to.exist;

      expect(newQuery.countFilterUserIds)
        .to.be.an('array');

      expect(newQuery.countFilterUserIds.length)
        .to.eql(0);
    });


    it('should call #setIntoCount', function () {

      expect(setIntoCountSpy)
        .to.have.been.calledOnce;

      expect(setIntoCountSpy)
        .to.have.been.calledWithExactly(filters);
    });


    it('should call #setFilters', function () {

      expect(setFiltersSpy)
        .to.have.been.calledOnce;

      expect(setFiltersSpy)
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


  describe('#setFilters', function () {


    it('should set countFilters', function () {

      var filters = [{
          method: 'count',
          name: 'Clicked login btn',
          op: '$eq',
          val: 0
        },

        {
          method: 'attr',
          name: 'platform',
          op: '$eq',
          val: 'Android'
        }

      ];

      Query.prototype.setFilters(filters);

      expect(Query.prototype.countFilters)
        .to.be.an('array');

      expect(Query.prototype.countFilters.length)
        .to.eql(1);

    });


    it('should set attrFilters', function () {

      var filters = [{
          method: 'count',
          name: 'Clicked login btn',
          op: '$eq',
          val: 0
        },

        {
          method: 'attr',
          name: 'platform',
          op: '$eq',
          val: 'Android'
        }

      ];

      Query.prototype.setFilters(filters);

      expect(Query.prototype.attrFilters)
        .to.be.an('array');

      expect(Query.prototype.attrFilters.length)
        .to.eql(1);

    });
  });



  describe('#genAttrMatchCond', function () {

    var cond;

    beforeEach(function () {
      Query.prototype.appId = 'BlaBlaID';
      Query.prototype.countFilterUserIds = [];

      var filters = [{
          method: 'count',
          name: 'Clicked login btn',
          op: '$eq',
          val: 0
        },

        {
          method: 'attr',
          name: 'platform',
          op: '$eq',
          val: 'Android'
        },

        {
          method: 'attr',
          name: 'amount',
          op: '$lt',
          val: 100
        },

        {
          method: 'attr',
          name: 'totalSessions',
          op: '$gt',
          val: 999
        }
      ];

      Query.prototype.filters = filters;
      Query.prototype.setFilters(filters);
      cond = Query.prototype.genAttrMatchCond();
    });


    it('should return condition with appId', function () {

      expect(cond.appId)
        .to.eql('BlaBlaID');
    });


    it('should handle $eq operator', function () {

      expect(cond.platform)
        .to.eql('Android');
    });


    it('should handle $lt operator', function () {

      expect(cond.amount)
        .to.eql({
          '$lt': 100
        });
    });


    it('should handle $gt operator', function () {

      expect(cond.totalSessions)
        .to.eql({
          '$gt': 999
        });
    });

    it('should set $in filter on _id if countFilterUserIds is valid',
      function () {
        var countFilterUserIds = [
          randomId,
          '5313123131'
        ];

        Query.prototype.countFilterUserIds = countFilterUserIds;

        cond = Query.prototype.genAttrMatchCond();

        expect(cond._id)
          .to.eql({
            '$in': countFilterUserIds
          });

      });

  });


  describe('#runAttrQuery', function () {

    before(function (done) {
      createUserFixtures(saved.apps.first._id, 100, done);
    });

    it('should fetch users', function (done) {

      Query.prototype.appId = saved.apps.first._id;
      Query.prototype.countFilterUserIds = [];
      Query.prototype.attrFilters = [];

      Query.prototype.runAttrQuery(function (err, users) {

        expect(err)
          .not.to.exist;

        expect(users)
          .to.be.an('array');

        expect(users.length)
          .to.eql(100);

        done();
      });

    });
  });


  describe('#reset', function () {

    before(function () {
      Query.prototype.appId = 'randomId';
      Query.prototype.query = {
        $and: [{
          key: 'val'
        }]
      };
      Query.prototype.rootOperator = ['$and'];
      Query.prototype.countFilters = ['notEmpty'];
      Query.prototype.attrFilters = ['notEmpty'];
      Query.prototype.countFilterUserIds = ['notEmpty'];
    });

    it('should reset all query params', function () {

      expect(Query.prototype.appId)
        .to.exist;

      Query.prototype.reset();

      expect(Query.prototype.appId)
        .not.to.exist;

      expect(Query.prototype.rootOperator)
        .not.to.exist;

      expect(Query.prototype.query)
        .to.be.empty;

      expect(Query.prototype.countFilters)
        .to.be.empty;

      expect(Query.prototype.attrFilters)
        .to.be.empty;

      expect(Query.prototype.countFilterUserIds)
        .to.be.empty;
    });

  });


  describe('#genCountGroupCond', function () {

    var spy;

    var countFilters = [

      {
        method: 'count',
        name: 'Clicked login btn',
        op: '$gt',
        val: 10
      },

      {
        method: 'count',
        name: 'Clicked logout btn',
        op: '$eq',
        val: 0
      },

    ];

    beforeEach(function () {
      Query.prototype.reset();
      spy = sinon.spy(Query.prototype, 'getCountFilterCond');
    });

    afterEach(function () {
      spy.restore();
    });


    it('should add $uid as _id for group operator', function () {

      var cond = Query.prototype.genCountGroupCond();
      expect(cond._id)
        .to.eql('$uid');
    });


    it('should add $uid as _id for group operator', function () {

      Query.prototype.countFilters = countFilters;
      var cond = Query.prototype.genCountGroupCond();

      expect(cond._id)
        .to.eql('$uid');
    });


    it('should call getCountFilterCond if valid countFilters', function () {

      Query.prototype.countFilters = countFilters;
      var cond = Query.prototype.genCountGroupCond();

      expect(spy)
        .to.have.been.calledTwice;

      expect(spy.args[0][0])
        .to.eql(countFilters[0]);

      expect(spy.args[1][0])
        .to.eql(countFilters[1]);
    });


    it('should create keys c_[i] for each new count query', function () {

      Query.prototype.countFilters = countFilters;
      var cond = Query.prototype.genCountGroupCond();

      expect(cond)
        .to.have.property("c_0");

    });


    it('should add $sum[$cond] property for each condition', function () {

      Query.prototype.countFilters = countFilters;
      var cond = Query.prototype.genCountGroupCond();

      expect(cond.c_0)
        .to.have.property("$sum");

      expect(cond.c_0.$sum)
        .to.have.property("$cond");

      expect(cond.c_0.$sum.$cond.then)
        .to.eql(1);

      expect(cond.c_0.$sum.$cond.
        else)
        .to.eql(0);

    });

  });


  describe('#genCountFilterCond', function () {


    beforeEach(function () {
      Query.prototype.reset();
      Query.prototype.rootOperator = '$or';
    });

    it('should return with base condition as $and', function () {
      var cond = Query.prototype.getCountFilterCond();

      expect(cond)
        .to.be.an("object");
      expect(cond.$and)
        .to.be.an('array');
      expect(cond)
        .not.to.have.property('$or');

    });

    it('should return condition with atleast the event.type equality',
      function () {

        var filter = {
          method: 'count',
          type: 'feature'
        };

        var cond = Query.prototype.getCountFilterCond(filter);

        expect(cond.$and[0])
          .to.eql({
            '$eq': ['$ev.t', 'feature']
          });


      });


    it(
      'should add events.name condition if name attr present',
      function () {

        var filter = {
          method: 'count',
          type: 'feature',
          name: 'Clicked login btn',
          op: '$gt',
          val: 10
        };

        var cond = Query.prototype.getCountFilterCond(filter);

        expect(cond.$and[1])
          .to.eql({
            '$eq': ['$ev.n', 'Clicked login btn']
          });

      });

    it(
      'should add events.feature condition if feature attr present',
      function () {

        var filter = {
          method: 'count',
          type: 'feature',
          feature: 'Authentication',
          name: 'Clicked login btn',
          op: '$gt',
          val: 10
        };

        var cond = Query.prototype.getCountFilterCond(filter);

        expect(cond.$and[2])
          .to.eql({
            '$eq': ['$ev.f', 'Authentication']
          });

      });

  });


  describe('#genCountMatchCond', function () {

    var spy;
    var countFilters = [

      {
        method: 'count',
        name: 'Clicked login btn',
        op: '$gt',
        val: 10
      },

      {
        method: 'count',
        name: 'Clicked logout btn',
        op: '$eq',
        val: 0
      },

    ];

    beforeEach(function () {
      Query.prototype.reset();
      spy = sinon.spy(Query.prototype, 'getCountFilterCond');
    });

    afterEach(function () {
      spy.restore();
    });

    it('should add conditions based on the rootOperator (and/or)',
      function () {

        Query.prototype.rootOperator = '$and';
        Query.prototype.countFilters = countFilters;
        var cond = Query.prototype.genCountMatchCond();

        expect(cond.$and)
          .to.be.an('array');
      });


    it('should add a match conditon for each countFilter',
      function () {

        Query.prototype.rootOperator = '$and';
        Query.prototype.countFilters = countFilters;
        var cond = Query.prototype.genCountMatchCond();

        expect(cond.$and.length)
          .to.eql(countFilters.length);
      });


    it('should add a match conditon with key c_[i] for each countFilter',
      function () {

        Query.prototype.rootOperator = '$and';
        Query.prototype.countFilters = countFilters;
        var cond = Query.prototype.genCountMatchCond();

        expect(cond.$and[0].c_0)
          .to.exist;

        expect(cond.$and[1].c_1)
          .to.exist;
      });

    it(
      'should not add additional $eq operand for countFilters with op=$eq',
      function () {

        Query.prototype.rootOperator = '$and';
        Query.prototype.countFilters = countFilters;
        var cond = Query.prototype.genCountMatchCond();

        expect(cond.$and[1].c_1)
          .not.to.have.property('$eq');

        expect(cond.$and[1].c_1)
          .to.eql(0);
      });

    it(
      'should add additional operand ($gt, $lt) for non-equality countFilters',
      function () {

        Query.prototype.rootOperator = '$and';
        Query.prototype.countFilters = countFilters;
        var cond = Query.prototype.genCountMatchCond();

        expect(cond.$and[0].c_0)
          .to.have.property('$gt');

        expect(cond.$and[0].c_0)
          .to.eql({
            '$gt': 10
          });
      });

  });


  describe('#runCountQuery', function () {

    var countFilters = [

      {
        method: 'count',
        type: 'pageview',
        name: 'Define Segment',
        op: '$gt',
        val: 0
      },

      {
        method: 'count',
        name: 'Clicked logout btn',
        op: '$lt',
        val: 1000000000
      },

    ];

    before(function (done) {
      createSessionFixtures(saved.apps.first._id, 100, done);
    });

    beforeEach(function () {
      Query.prototype.reset();
      Query.prototype.appId = saved.apps.first._id;
      Query.prototype.countFilters = countFilters;
      Query.prototype.rootOperator = '$and';
    });

    it('should aggregate user ids', function (done) {

      Query.prototype.runCountQuery(function (err, uids) {

        expect(err)
          .not.to.exist;

        expect(uids)
          .to.be.an('array');

        expect(uids)
          .to.have.length.above(0);

        done();
      });

    });


    it('should call #genCountGroupCond', function (done) {

      var spy = sinon.spy(Query.prototype, 'genCountGroupCond');


      Query.prototype.runCountQuery(function (err, uids) {

        expect(spy)
          .to.be.calledOnce;

        Query.prototype.genCountGroupCond.restore();
        done();
      });

    });


    it('should call #genCountMatchCond', function (done) {

      var spy = sinon.spy(Query.prototype, 'genCountMatchCond');


      Query.prototype.runCountQuery(function (err, uids) {

        expect(spy)
          .to.be.calledOnce;

        Query.prototype.genCountMatchCond.restore();
        done();
      });

    });
  });

});
