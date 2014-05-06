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
var ObjectId = require('mongoose')
  .Types.ObjectId;


/**
 * Models
 */

var User = require('../models/User');
var Session = require('../models/Session');


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
 * - Operations allowed on frontend:
 *  - equals
 *  - does not equal ($ne)
 *  - less than ($lt)
 *  - greater than ($gt)
 *  - contains
 *  - does not contain
 *
 *
 * TODO:
 *
 * - attr queries should adhere to the rootOperator specification
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
 *   op: '$and',
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
 * @param {string} aid
 * @param {object} query
 *
 * return {Query}
 */

function Query(aid, query) {


  this.aid = aid;

  this.countFilters = [];
  this.attrFilters = [];
  this.countFilterUserIds = [];

  // root level operator $and/$or
  this.rootOperator = query.op;

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
  this.setFilters(filters);


  return this;

}


/**
 * Resets all query vars
 * Useful during testing
 *
 * @return {Query}
 */

Query.prototype.reset = function () {
  this.aid = null;
  this.query = {};

  this.countFilters = [];
  this.attrFilters = [];
  this.countFilterUserIds = [];
  this.rootOperator = null;

  return this;
};


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
 * Sets this.countFilters and this.attrFilters
 *
 * @param {array} filters
 * @return {Query}
 */

Query.prototype.setFilters = function (filters) {
  var self = this;

  this.countFilters = _.filter(filters, {
    'method': 'count'
  });
  this.attrFilters = _.filter(filters, {
    'method': 'attr'
  });

  return this;
};


Query.prototype.run = function (cb) {

  var self = this;


  async.series({

      countQuery: function (cb) {

        // if there are no count queries to be made, move on
        if (!self.countFilters.length) {
          return cb();
        }

        self.runCountQuery.call(self, function (err, uids) {

          if (err) {
            return cb(err);
          }

          self.countFilterUserIds = uids;

          return cb();
        });

      },

      attrQuery: function (cb) {

        self.runAttrQuery.call(self, function (err, users) {

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


/**
 * Run count queries on the Session collection
 *
 * @param {function} cb callback function
 * @return {Query}
 */

Query.prototype.runCountQuery = function (cb) {

  var self = this;

  Session
    .aggregate()
    .match({
      aid: new ObjectId(self.aid.toString())
    })
    .unwind('ev')
    .group(self.genCountGroupCond.call(self))
    .match(self.genCountMatchCond.call(self))
    .project({
      _id: 1
    })
    .exec(function (err, result) {

      if (err) {
        return cb(err);
      }
      var uids = _.pluck(result, '_id');

      cb(null, uids);
    });

  return this;
};


/**
 * Run attribute queries on the Users collection
 *
 * @param {function} cb callback function
 * @return {Query}
 */

Query.prototype.runAttrQuery = function (cb) {

  var self = this;

  User
    .find(self.genAttrMatchCond())
    .exec(function (err, users) {
      cb(err, users);
    })

  return this;
};


/**
 * Creates the condition object for querying through users collection
 *
 * @return {object} conditions
 */

Query.prototype.genAttrMatchCond = function () {
  var cond = {
    aid: this.aid
  };

  _.each(this.attrFilters, function (filter) {
    var operation = filter.op;

    if (operation === '$eq') {

      cond[filter.name] = filter['val'];

    } else {

      // FIXME: add checks for contains, does not contain operations

      cond[filter.name] = {};
      cond[filter.name][filter.op] = filter['val'];
    }

  });

  if (this.countFilterUserIds.length) {
    cond['_id'] = {
      '$in': this.countFilterUserIds
    };
  }

  return cond;
};


/**
 * Creates a 'group' pipe for Session aggregation
 * It groups by usedid and provides a count of all given events
 *
 * @return {object} pipeline group query object
 */

Query.prototype.genCountGroupCond = function () {
  var self = this;

  var pipe = {
    _id: '$uid'
  };

  _.each(self.countFilters, function (filter, i) {
    var key = 'c_' + i;
    var countFilterCond = self.getCountFilterCond(filter);

    pipe[key] = {
      $sum: {
        $cond: {
          if :countFilterCond,
          then: 1,
          else :0
        }
      }
    };

  });

  return pipe;
};


/**
 * Generates the condition for the match operator in runCountQuery
 *
 * @return {object} match pipe condition
 */

Query.prototype.genCountMatchCond = function () {

  var self = this;
  var pipe = {};

  pipe[self.rootOperator] = [];

  _.each(self.countFilters, function (filter, i) {

    var key = 'c_' + i;
    var cond = {};

    if (filter.op === '$eq') {

      cond[key] = filter.val;

    } else {

      cond[key] = {};
      cond[key][filter.op] = filter.val;

    }

    pipe[self.rootOperator].push(cond);

  });

  return pipe;

};


/**
 * For a countFilter, it takes the count object and creates a boolean condition
 * to check if the event ocurred
 *
 * @param {object} countFilter
 * @return {object} condition
 */

Query.prototype.getCountFilterCond = function (filter) {

  var cond = {};
  filter = filter || {};

  cond['$and'] = [];

  // event type is a compulsory field
  cond['$and'].push({
    $eq: ['$ev.t', filter.type]
  });

  if (filter.name) {
    cond['$and'].push({
      $eq: ['$ev.n', filter.name]
    });
  }

  if (filter.feature) {
    cond['$and'].push({
      $eq: ['$ev.f', filter.feature]
    });
  }

  return cond;
};
