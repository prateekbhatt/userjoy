/**
 * This module contains functions to query the Users and Events
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
var Event = require('../models/Event');


/**
 * Helpers
 */

var logger = require('../../helpers/logger');
var metadata = require('../../helpers/metadata');


/**
 * Maps mongo db operators w.r.t. defined by UserJoy client
 * @type {Object}
 */

var OP_MAP = {
  and: '$and',
  or: '$or',
  eq: '$eq',
  gt: '$gt',
  lt: '$lt',

  // special case, self defined
  // REF: http://stackoverflow.com/a/10616781/1463434
  contains: '$contains'
};


/**
 * Expose the Query constructor
 */

module.exports = Query;


/**
 * helper to convert from days ago to timestamp
 * i.e. 3 days ago, to timestamp in milliseconds
 */

function dateFromDaysAgo(days) {

  var date = moment()
    .utc()
    .subtract('days', days)
    .startOf('day')
    .toDate();

  return date;
}


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
 * - Run in two sequential queries: the count aggregate query (Event
 * collection) should be run before the attr find query (User collection)
 * - This will make sure the user dataset always fetched in the second query
 *
 * - Operations allowed on frontend:
 *  - equals (eq)
 *  - less than (lt)
 *  - greater than (gt)
 *  - contains (contains)
 *
 * - User 'joined' and 'lastSession' are numbers that signify 'x days ago'
 * so, 'joined' value of 7 means 7 days ago
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
 *   op: 'and',
 *   fromAgo: 7,
 *   toAgo: 2,
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
 *         type: 'track',
 *         name: 'new chat',
 *         module: 'group'
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
 *       },
 *
 *       {
 *         method: 'attr',
 *         name: 'joined',
 *         op: 'gt',
 *         val: 7
 *       }
 *
 *
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


  // sanitize the query object
  query = sanitize(query);

  this.aid = aid;
  this.fromAgo = query.fromAgo;
  this.toAgo = query.toAgo;

  // store users filtered
  this.filteredUsers = [];

  this.countFilteredUids = [];

  // set root level operator as $and/$or
  this.rootOperator = null;
  if (_.contains(['and', 'or'], query.op)) {
    this.rootOperator = OP_MAP[query.op];
  } else {
    throw new Error('op must be one of and/or');
  }

  var filters = query.filters;

  _.each(filters, function (f) {
    if (f.op) {
      if (OP_MAP[f.op]) {
        f.op = OP_MAP[f.op];
      } else {
        throw new Error('Invalid filter op: ' + f.op);
      }
    }
  });

  // separate Event count queries and User attribute queries
  this.setIntoCount(filters);

  this.countFilters = _.filter(filters, {
    'method': 'count'
  });

  this.attrFilters = _.filter(filters, {
    'method': 'attr'
  });

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
  this.fromAgo = null;
  this.toAgo = null;
  this.countFilteredUids = [];
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


Query.prototype.run = function (cb) {

  var self = this;


  async.series(

    {

      countQuery: function (cb) {

        // count query needs to run before attribute query because the counts
        // anyways need to run on ALL events belonging to app
        //
        // This is because if we do not do that, we would not be able to
        // effectively run 'hasnotdone' or 'count=0' events. We need to have an
        // event for each user getting into the pipeline


        // if there are no count queries to be made, move on
        if (!self.countFilters.length) return cb();

        self.runCountQuery.call(self, function (err, uids) {
          if (err) return cb(err);

          // reset the countFilteredUids to the updated list of users
          self.countFilteredUids = _.map(uids, function (id) {
            return id.toString();
          });


          return cb();
        });

      },

      attrQuery: function (cb) {

        // the attr query must run after the count query. read comments above
        // thecountFilteredUids are taken as an input while running the
        // attribute queries

        self.runAttrQuery.call(self, function (err, users) {
          if (err) return cb(err);
          self.filteredUsers = users;
          return cb();
        });

      },

      metadataToObject: function (cb) {

        if (!self.filteredUsers.length) return cb();

        var users = _.map(self.filteredUsers, function (u) {
          if (u.toJSON) u = u.toJSON();
          u.custom = metadata.toObject(u.custom);
          return u;
        });

        self.filteredUsers = users;

        cb();
      }
    },

    function (err) {

      if (err) {

        logger.crit({
          at: 'query run',
          err: err
        });

        return cb(err);
      }

      return cb(null, self.filteredUsers);

    });
};


/**
 * Run count queries on the Event collection
 *
 * @param {function} cb callback function
 * @return {Query}
 */

Query.prototype.runCountQuery = function (cb) {

  var self = this;

  Event
    .aggregate()
    .match(self.genCountBaseMatchCond.call(self))
    .group(self.genCountGroupCond.call(self))
    .match(self.genCountGroupMatchCond.call(self))
    .project({
      _id: 1
    })
    .exec(function (err, result) {

      if (err) return cb(err);
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
    .lean()
    .exec(function (err, users) {
      cb(err, users);
    });

  return this;
};


/**
 * Creates the condition object for querying through users collection
 *
 * @return {object} conditions
 */

Query.prototype.genAttrMatchCond = function () {

  var self = this;
  var root = self.rootOperator;

  var cond = {
    $and: []
  };

  // add app id condition
  cond['$and'].push({
    aid: this.aid
  });


  var filterQueries = {};
  filterQueries[root] = [];

  _.each(this.attrFilters, function (f) {
    var op = f.op;

    // new condition specific to filter
    var c = {};

    c[f.name] = {};


    // joined and lastSession are special properties. we will handle them separately
    if (!_.contains(['joined', 'lastSession'], f.name)) {


      if (op === '$contains') {

        // REF: http://stackoverflow.com/a/10616781/1463434
        c[f.name].$regex = ".*" + f.val + ".*";
        // Also, it should do case-insensitive queries
        c[f.name].$options = 'i';

      } else if (op === '$eq') {

        c[f.name] = f.val;

      } else {
        // if op is $gt, $lt

        c[f.name][op] = f.val;
      }


    } else {


      // joined and lastSession are special properties. their vals are in terms of
      // number of days ago, which need to converted into timestamp


      // Also, we need to switch lessThan (lt) and greaterThan (gt) because
      // lessThan 100 days ago essentially means greater than the calculated
      // timestamp
      var startOfThatDay = dateFromDaysAgo(f.val);
      var endOfThatDay = dateFromDaysAgo(f.val - 1);

      if (op === '$gt') {

        c[f.name].$lt = startOfThatDay;

      } else if (op === '$lt') {

        c[f.name].$gte = startOfThatDay;

      } else {

        // if joined/lastSession name and eq op then we need to take a date range from
        // start to end of day

        c[f.name] = {
          $gte: startOfThatDay,
          $lt: endOfThatDay
        };

      }

    }




    filterQueries[root].push(c);

  });



  // if there are countFilters, then the countFilter query must have been run.
  // in that case, the uids output by the countQuery must be taken into account
  //
  // However, if there are no countFilters defined, then the output of the countQuery
  // does not matter

  if (self.countFilters && self.countFilters.length) {
    filterQueries[root].push({
      '_id': {
        '$in': self.countFilteredUids
      }
    });
  }


  if (!_.isEmpty(filterQueries[root])) cond['$and'].push(filterQueries);

  return cond;
};



/**
 * Creates a 'group' pipe for Event aggregation
 * It groups by uid and provides a count of all given events
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
 * Generates the condition for the first match operator in runCountQuery
 *
 * @return {object} match pipe condition
 */

Query.prototype.genCountBaseMatchCond = function () {

  var self = this;

  var matchConds = {
    aid: new ObjectId(self.aid.toString())
  };


  // function dateDaysAgo(days) {
  //   var date = new Date(new Date()
  //     .getTime() - 86400000 * days);

  //   return date;
  // }


  // if fromAgo and/or toAgo are present, add created time condions

  // if (self.fromAgo || self.toAgo) {
  //   matchConds.ct = {};

  //   if (self.fromAgo) {
  //     matchConds.ct.$gt = dateDaysAgo(self.fromAgo)
  //   }

  //   if (self.toAgo) {
  //     matchConds.ct.$lt = dateDaysAgo(self.toAgo)
  //   }
  // }

  // FIXME : this documentation just below
  // if there are countFilters, then the countFilter query must have been run.
  // in that case, the uids output by the countQuery must be taken into account
  //
  // However, if there are no countFilters defined, then the output of the countQuery
  // does not matter
  //
  // if the root operator is and, then we could take the output of the attribute
  // query as another input to the count query
  // if (self.rootOperator === '$and') {
  //   matchConds['uid'] = {
  //     '$in': self.attrFilteredUids
  //   };
  // }


  return matchConds;

};


/**
 * Generates the condition for the match operator after group in runCountQuery
 *
 * @return {object} match pipe condition
 */

Query.prototype.genCountGroupMatchCond = function () {

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

  var self = this;
  var cond = {};
  filter = filter || {};

  cond['$and'] = [];

  // event type is a compulsory field
  cond['$and'].push({
    $eq: ['$type', filter.type]
  });

  if (filter.name) {
    cond['$and'].push({
      $eq: ['$name', filter.name]
    });
  }

  if (filter.module) {
    cond['$and'].push({
      $eq: ['$module', filter.module]
    });
  }

  // if fromAgo and/or toAgo are present, add created time condions

  if (self.fromAgo) {

    cond['$and'].push({
      $gt: ['$ct', dateFromDaysAgo(self.fromAgo)]
    });

  }

  if (self.toAgo) {
    cond['$and'].push({
      $lt: ['$ct', dateFromDaysAgo(self.toAgo)]
    });
  }

  return cond;
};



/**
 * Sanitizes the query object
 *
 * e.g.
 *
 * BEFORE:
 *
 * {
 *   list: 'users',
 *   op: 'and',
 *   filters: [
 *     {
 *       method: 'hasdone',
 *       type: 'track',
 *       name: 'Define Segment',
 *       op: '',
 *       val: ''
 *     }
 *   ]
 * }
 *
 *
 * AFTER:
 *
 * {
 *   list: 'users',
 *   op: 'and',
 *   filters: [
 *     {
 *       method: 'hasdone',
 *       type: 'track',
 *       name: 'Define Segment'
 *     }
 *   ]
 * }
 *
 *
 * @param {object} q the query object
 * @return {object} sanitized query object
 */

function sanitize(q) {



  _.each(q.filters, function (f) {

    // throw error if query filter is not one of ['hasdone', 'hasnotdone', 'count', 'attr']
    if (!_.contains(['hasdone', 'hasnotdone', 'count', 'attr'], f.method)) {
      throw new Error(
        'Query filter must be one of hasdone/hasnotdone/count/attr');
    }

    if (_.contains(['hasdone', 'hasnotdone'], f.method)) {
      delete f.op;
      delete f.val;
    }

    if (f.val && f.method === 'count') {
      f.val = parseInt(f.val, 10);
    }


    // joined and lastSession attributes represent 'number of days ago'
    if (f.method === 'attr' && _.contains(['joined', 'lastSession'], f.name)) {
      f.val = parseInt(f.val, 10);
    }

  });


  // sometimes the parsed query object contains the 'op' in the form of an
  // array. This situation needs to be taken care of. e.g.
  //
  // BEFORE:
  // op: [ 'and', '' ]
  //
  // AFTER:
  // op: 'and'

  if (_.isArray(q.op)) {
    q.op = q.op[0];
  }

  // if query has fromAgo and toAgo vals, parseInt the fromAgo/toAgo vals
  if (q.fromAgo) q.fromAgo = parseInt(q.fromAgo, 10);
  if (q.toAgo) q.toAgo = parseInt(q.toAgo, 10);

  logger.trace({
    at: 'lib/query sanitized',
    q: q ? JSON.stringify(q) : null,
    f: q.filters
  });

  return q;
};

module.exports.sanitize = sanitize;
