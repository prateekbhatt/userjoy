describe('Lib query', function () {

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

  var createUserFixtures = require('../../fixtures/UserFixture');
  var createEventFixtures = require('../../fixtures/EventFixture');


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

    queryObj = {
      op: 'and',
      filters: filters
    };

    beforeEach(function () {
      setIntoCountSpy = sinon.spy(Query.prototype, 'setIntoCount');
      newQuery = new Query(saved.apps.first._id, queryObj);
    });

    afterEach(function () {
      Query.prototype.setIntoCount.restore();
    });


    it('should throw error if op is not one of and/or', function () {

      var newQueryObj = {
        op: '$and',
        filters: filters
      };


      expect(function () {
        return new Query(saved.apps.first._id, newQueryObj)
      })
        .to.
      throw ('op must be one of and/or');


    });


    it('should set aid', function () {

      expect(newQuery.aid)
        .to.eql(saved.apps.first._id);
    });


    it('should set rootOperator', function () {

      expect(newQuery.rootOperator)
        .to.eql('$and');
    });


    it('should set default countFilterUserIds', function () {

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


    it('should set countFilters', function () {

      expect(newQuery.countFilters)
        .to.be.an('array');

      expect(newQuery.countFilters.length)
        .to.eql(1);

    });


    it('should set attrFilters', function () {

      expect(newQuery.attrFilters)
        .to.be.an('array');

      expect(newQuery.attrFilters.length)
        .to.eql(1);

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


  describe('#genAttrMatchCond', function () {

    var cond;

    beforeEach(function () {
      Query.prototype.aid = 'BlaBlaID';
      Query.prototype.countFilterUserIds = [];

      var attrFilters = [{
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
          name: 'totalEvents',
          op: '$gt',
          val: 999
        }
      ];

      Query.prototype.attrFilters = attrFilters;
      cond = Query.prototype.genAttrMatchCond();
    });


    it('should return condition with aid', function () {

      expect(cond.aid)
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

      expect(cond.totalEvents)
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

      Query.prototype.aid = saved.apps.first._id;
      Query.prototype.countFilterUserIds = [];
      Query.prototype.attrFilters = [];

      Query.prototype.runAttrQuery(function (err, users) {

        expect(err)
          .not.to.exist;

        expect(users)
          .to.be.an('array');

        expect(users.length)
          .to.eql(102);

        done();
      });

    });
  });


  describe('#reset', function () {

    before(function () {
      Query.prototype.aid = 'randomId';
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

      expect(Query.prototype.aid)
        .to.exist;

      Query.prototype.reset();

      expect(Query.prototype.aid)
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
            '$eq': ['$type', 'feature']
          });


      });


    it('should add events.name condition if name attr present',
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
            '$eq': ['$name', 'Clicked login btn']
          });

      });

    it('should add events.feature condition if feature attr present',
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
            '$eq': ['$feature', 'Authentication']
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

    var aid, uids;

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
        type: 'feature',
        name: 'Clicked logout btn',
        op: '$lt',
        val: 10000
      },

    ];

    before(function (done) {
      var uid1 = saved.users.first._id;
      var uid2 = saved.users.second._id;

      aid = saved.apps.first._id;
      uids = [uid1, uid2];
      createEventFixtures(aid, uids, 100, done);
    });

    beforeEach(function () {
      Query.prototype.reset();
      Query.prototype.aid = saved.apps.first._id;
      Query.prototype.countFilters = countFilters;
      Query.prototype.rootOperator = '$and';
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


    it('should aggregate user ids', function (done) {
      Query.prototype.runCountQuery(function (err, userIds) {

        expect(err)
          .not.to.exist;

        expect(userIds)
          .to.be.an('array');

        expect(userIds)
          .to.have.length(uids.length);

        done();
      });

    });


    it(
      'should return empty error if query has hasdone and hasnotdone filters on the same event',
      function (done) {

        Query.prototype.countFilters = [

          // hasdone
          {
            method: 'count',
            type: 'feature',
            name: 'Define Segment',
            op: '$gt',
            val: 0
          },


          // hasnotdone
          {
            method: 'count',
            type: 'feature',
            name: 'Define Segment',
            op: '$eq',
            val: 0
          },

        ];

        Query.prototype.runCountQuery(function (err, userIds) {

          expect(err)
            .not.to.exist;

          expect(userIds)
            .to.be.an('array');

          expect(userIds)
            .to.be.empty;

          done();
        });

      });


  });


  describe('#run', function () {

    var countFilters = [

      {
        method: 'count',
        type: 'pageview',
        name: 'Define Segment',
        op: '$gt',
        val: 0
      }

    ];

    var attrFilters = [

      {
        method: 'attr',
        type: 'email',
        op: '$eq',
        val: email
      }

    ];

    var aid;
    var uid;
    var email = 'p@userjoy.co'

    before(function (done) {

      aid = saved.apps.first._id;
      uid = randomId;
      var uids = [uid];
      createEventFixtures(aid, uids, 100, function (err) {

        // TODO: user id should not be hardcoded here like this
        // It would break if the uid the changed in fixtureEvent.js

        User.create({
          _id: '532d6bf862d673ba7131812a',
          aid: aid,
          email: email
        }, done);
      });
    });

    beforeEach(function () {
      Query.prototype.reset();
      Query.prototype.countFilters = countFilters;
      Query.prototype.attrFilters = attrFilters;
      Query.prototype.aid = aid;
      Query.prototype.rootOperator = '$and';
      Query.prototype.countFilterUserIds = [];
      Query.prototype.filteredUsers = [];
    });

    it('should not call #runCountQuery if no countFilters',
      function (done) {

        var spy = sinon.spy(Query.prototype, 'runCountQuery');
        Query.prototype.countFilters = [];

        Query.prototype.run(function (err) {

          expect(spy)
            .not.to.have.been.called;

          Query.prototype.runCountQuery.restore();

          done();
        });

      });


    it('should call #runCountQuery if countFilters exist',
      function (done) {

        var spy = sinon.spy(Query.prototype, 'runCountQuery');

        Query.prototype.run(function (err) {

          expect(spy)
            .to.have.been.calledOnce;

          Query.prototype.runCountQuery.restore();

          done();
        });

      });


    it('should call #runCountAttrQuery',
      function (done) {

        var spy = sinon.spy(Query.prototype, 'runAttrQuery');

        Query.prototype.run(function (err) {

          expect(spy)
            .to.have.been.calledOnce;

          Query.prototype.runAttrQuery.restore();

          done();
        });

      });


    it('should set countFilterUserIds',
      function (done) {

        Query.prototype.run(function (err) {

          expect(Query.prototype.countFilterUserIds)
            .to.have.length.above(0);
          done();
        });

      });


    it('should set filteredUsers', function (done) {

      Query.prototype.run(function (err, users) {

        expect(Query.prototype.filteredUsers)
          .to.have.length.above(0);

        expect(users)
          .to.have.length.above(0);

        expect(users[0].email)
          .to.eql(email);

        done();
      });
    });

    it('should return all users if no filter is provided',
      function (done) {
        Query.prototype.attrFilters = [];
        Query.prototype.countFilters = [];

        User.count(function (err, count) {
          expect(err)
            .to.not.exist;

          expect(count)
            .to.exist;

          Query.prototype.run(function (err, users) {

            expect(err)
              .to.not.exist;

            expect(users)
              .to.be.an("array");

            expect(users)
              .to.have.length(count);

            done()
          })

        })


      });

  });


  describe('#sanitize', function () {

    var before = {
      list: 'users',
      op: 'and',
      filters: [{
        method: 'hasdone',
        type: 'feature',
        name: 'Define Segment',
        op: '',
        val: ''
      }]
    }



    var after = {
      list: 'users',
      op: 'and',
      filters: [{
        method: 'hasdone',
        type: 'feature',
        name: 'Define Segment'
      }]
    };

    it('should remove empty op/val values in hasdone/hasnotdone filters',
      function () {

        expect(before.filters[0])
          .to.have.property("op");

        expect(before.filters[0])
          .to.have.property("val");

        expect(before)
          .to.not.eql(after);

        Query.sanitize(before);

        expect(before.filters[0])
          .to.not.have.property("op");

        expect(before.filters[0])
          .to.not.have.property("val");

        expect(before)
          .to.eql(after);

      });

  });

});
