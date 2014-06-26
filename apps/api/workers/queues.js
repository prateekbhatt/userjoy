/**
 * This module contains all the queues
 */


/**
 * npm dependencies
 */

var _ = require('lodash');
var async = require('async');
var iron_mq = require('iron_mq');


/**
 * returns function which returns queue object
 *
 * all this currying complexity had to be introduced because the config
 * file needs the env variable or else throw an error
 */

function newQueue(name) {

  return function () {

    /**
     * Config settings
     */

    var config = require('../../config')('api');


    /**
     * Create iron mq client instance
     */

    var imq = new iron_mq.Client({
      token: config.ironioToken,
      project_id: config.ironioProjectId
    });


    return imq.queue(name);
  }

}


/**
 * setup 'automessge' queue on iron mq
 */

module.exports.automessage = newQueue('automessage');


/**
 * setup 'usage' queue on iron mq
 */

module.exports.usage = newQueue('usage');


/**
 * setup 'score' queue on iron mq
 */

module.exports.score = newQueue('score');


/**
 * setup 'health' queue on iron mq
 */

module.exports.health = newQueue('health');
