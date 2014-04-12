/**
 * This module contains functions to query the Users and Sessions
 * collections
 */

/**
 * Module dependencies
 */

var _ = require('lodash');
var async = require('async');
var moment = require('moment');


/**
 * Models
 */

var App = require('../models/App');
var User = require('../models/User');
var Sessions = require('../models/Session');


/**
 * Expose the Query constructor
 */

module.exports = Query;


/**
 * Query constructor
 *
 *
 * Types of methods:
 *
 * - count (of an event)
 * - hasdone : count > 0 (variant of count)
 * - hasnotdone : count = 0 (variant of count)
 * - attr : check against an attr of user
 *
 *
 * NOTES:
 *
 * - Run in two sequential queries: the count aggregate query (Session
 * collection) should be run before the attr find query (User collection)
 * - This will make sure the user dataset always fetched in the second query
 *
 * TODO:
 *
 * - rename countQuery and attrQuery into countFilter and attrFilter
 * - rename most queries into filters
 *
 *
 * PSEUDO CODE:
 *
 * - update hasdone and hasnotdone filters into count filters
 * - group into [count] and [attr] filters
 * - update hasdone and hasnotdone into equivalent count methods
 *
 *
 * Sample query object:
 *
 * {
 *   list: 'users',
 *   op: 'and',
 *   filters: [
 *       {
 *         method: 'count',
 *         type: 'pageviews',
 *         name: '/login',
 *         op: 'gt',
 *         val: 20
 *       },
 *
 *       {
 *         method: 'hasdone',
 *         type: 'pageviews',
 *         name: '/onboarding'
 *       },
 *
 *       {
 *         method: 'hasnotdone',
 *         type: 'feature',
 *         name: 'new chat',
 *         feature: 'group'
 *       },
 *
 *       {
 *         method: 'count',
 *         type: 'pageviews',
 *         name: '/onboarding',
 *         op: 'gt',
 *         val: 0
 *       },
 *
 *       {
 *         method: 'attr',
 *         name: 'platform',
 *         op: 'contains',
 *         val: 'Android'
 *       }
 *     ]
 * }
 *
 *
 *
 * TO IMPLEMENT OR NOT TO IMPLEMENT:
 * - pagination with skip and limit
 *
 *
 *
 * @param {string} appId
 * @param {object} query
 *
 * return {Query}
 */

function Query(appId, query) {


  this.appId = appId;
  this.query = query || {};

  this.userQuery = {};
  this.sessionQuery = {};
  this.countQueries = [];
  this.attrQueries = [];
  this.countQueryFilteredUserIds = [];

  var filters = query.filters;

  // all event queries will operate for events since the startDate and till
  // endDate
  //
  // by default, the startDate will be 30 days prior, and endDate today
  this.startDate = moment()
    .subtract('days', 30)
    .format();

  this.endDate = moment()
    .format();


  // separate Session count queries and User attribute queries
  this.setIntoCount(filters);
  this.setQueries(filters);


  return this;

}


/**
 * Updates a hasnotdone method into a count method
 *
 * Example:
 *
 * Before:
 *
 * {
 *   method: 'hasnotdone',
 *   name: 'Create new chat'
 * }
 *
 *
 * After:
 *
 * {
 *   method: 'count',
 *   name: 'Create new chat',
 *   op: '$eq',
 *   val: 0
 * }
 *
 *
 * @param {object} q query object
 * @return {Query}
 */

Query.prototype.hasnotdoneIntoCount = function (q) {

  q.method = 'count';
  q.op = '$eq';
  q.val = 0;

  return this;
};


/**
 * Updates a hasdone method into a count method
 *
 * Example:
 *
 * Before:
 *
 * {
 *   method: 'hasdone',
 *   name: 'Create new chat'
 * }
 *
 *
 * After:
 *
 * {
 *   method: 'count',
 *   name: 'Create new chat',
 *   op: '$gt',
 *   val: 0
 * }
 *
 *
 * @param {object} q query object
 * @return {Query}
 */

Query.prototype.hasdoneIntoCount = function (q) {

  q.method = 'count';
  q.op = '$gt';
  q.val = 0;

  return this;
};


/**
 * Updates hasdone and hasnotdone methods into count methods
 *
 * @param {array} filters
 * @return {Query}
 */

Query.prototype.setIntoCount = function (filters) {
  var self = this;

  _.each(filters, function (q) {
    if (q.method === 'hasdone') {

      self.hasdoneIntoCount(q);

    } else if (q.method === 'hasnotdone') {

      self.hasnotdoneIntoCount(q);
    }

  });

  return this;
};


/**
 * Sets this.countQueries and this.attrQueries
 *
 * @param {array} filters
 * @return {Query}
 */

Query.prototype.setQueries = function (filters) {
  var self = this;

  this.countQueries = _.filter(filters, {
    'method': 'count'
  });
  this.attrQueries = _.filter(filters, {
    'method': 'attr'
  });

  return this;
};


Query.prototype.aggFromUser = function (cb) {

  User
    .aggregate()
    .match({
      appId: this.appId
    })
    .match({})

};


Query.prototype.aggFromSession = function (cb) {

  Ses
};


Query.prototype.run = function (cb) {

  var self = this;


  async.series({

      runCountQuery: function (cb) {

        // if there are no count queries to be made, move on
        if (!self.countQueries.length) {
          return cb();
        }

        self.runCountQuery(function (err, userIds) {

          if (err) {
            return cb(err);
          }

          self.countQueryFilteredUserIds = userIds;

          return cb();
        });

      },

      runAttrQuery: function (cb) {

        self.runAttrQuery(function (err, users) {

          if (err) {
            return cb(err);
          }

          self.filteredUsers = users;

          return cb();
        });

      }
    },

    function (err) {

      if (err) {
        return cb(err);
      }

      return cb(null, self.filteredUsers);

    });
};



Query.prototype.runCountQuery = function (cb) {

  var self = this;

  Session
    .aggregate({
      $match: {
        appId: self.appId
      }
    })
    .unwind('events')
    .group(self.genCountPipe())
    .match(self.genMatchAfterCountPipe())
    .project({
      _id: 1
    })
    .exec(function (err, result) {

      if (err) {
        return cb(err);
      }

      console.log('runCountQuery res', result);

      var userIds = _.pluck(result['result'], '_id');

      cb(null, userIds);
    });

};


Query.prototype.runAttrQuery = function (cb) {

  var self = this;

  Users
    .find(self.genUserMatchCond())
    .exec(function (err, users) {
      cb(err, users);
    })
};


Query.prototype.genUserMatchCond = function () {
  var cond = {
    appId: this.appId
  };

  _.each(this.userQuery, function (filter) {
    cond[filter.name] = {};
    cond[filter.name][filter.op] = filter[val];
  });

  if (this.countQueryFilteredUserIds.length) {
    cond['_id'] = {
      '$in': this.countQueryFilteredUserIds
    };
  }

  return cond;
};



Query.prototype.genCountPipe = function () {
  var self = this;

  var pipe = {
    _id: '$userId'
  };

  _.each(self.countQueries, function (filter, i) {
    var key = 'c_' + i;

    pipe[key] = {
      $sum: {
        $cond: {
          if :self.getCountFilterCond(filter),
          then: 1,
          else :0
        }
      }
    };

  });

  return pipe;
};


Query.prototype.genMatchAfterCountPipe = function () {

  var self = this;

  var pipe = {};

  _.each(self.countQueries, function (filter, i) {
    var key = 'c_' + i;

    pipe[key] = {};
    pipe[key][filter['$op']] = filter['val'];
  });

  return pipe;

};


Query.prototype.getCountFilterCond = function (filter) {

  var cond = {
    $and: {}
  };

  // event type is a compulsory field
  cond['$and']['$eq'] = ['$events.type', type];


  if (filter.name) {
    cond['$and']['$eq'] = ['$events.name', name];
  }

  if (filter.feature) {
    cond['$and']['$eq'] = ['$events.feature', feature];
  }

  return cond;

};




/**
 * For a countQuery, it takes the count object and creates a boolean condition
 * to check if the event ocurred
 *
 * @param {object} countQuery
 * @return {object} condition
 */

Query.prototype.groupCountCondition = function (countQuery) {

  var cond = {
    $and: []
  };

  cond['$and'].push({
    '$eq': ['$events.type', q.type]
  });

  if (q.name) {
    cond['$and'].push({
      '$eq': ['$events.name', q.name]
    });
  }

  if (q.feature) {
    cond['$and'].push({
      '$eq': ['$events.feature', q.feature]
    });
  }

  return cond;
};


/**
 * Creates a 'group' pipe for Session aggregation
 * It groups by usedid and provides a count of all given events
 *
 * @return {object} pipeline group query object
 */

// Query.prototype.pipeGroup = function () {

//   var self = this;

//   var pipe = {
//     _id: '$userId'
//   };

//   _.each(self.countQueries, function (q, i) {

//     var key = 'c_' + i;

//     pipe[key] = {
//       $sum: {
//         $cond: {
//           if :self.groupCountCondition(q),
//           then: 1,
//           else :0
//         }
//       }
//     };

//   });

//   return pipe;
// };

Query.prototype.countOf = function (type, name, cb) {

  var firstEventQuery = {};

  if (name) {

    firstEventQuery = {
      $and: [{
        $eq: ['events.type', type]
      }, {
        $eq: ['events.name', name]
      }]
    }

  } else {

    firstEventQuery = {
      $eq: ['events.type', type]
    }

  }

  Session
    .aggregate()
    .match({
      appId: this.appId,
      createdAt: {
        $gte: this.startDate
      }
    })
    .unwind('events')
    .group({
      _id: 'userId',
      count: {
        $sum: {
          $cond: {
            if :firstEventQuery,
            then: 1,
            else :0
          }
        }
      }
    })
    .skip(this.skip)
    .limit(this.limit)
    .exec(function (err, val) {

      if (err) {
        cb(err);
      }

      // TODO check for fail case below
      cb(null, val['result'][0]['count']);

    });


  Event
    .find()


  return this;

};
