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
 * Config settings
 *
 * TODO: move these to central config settings file
 */

var TOKEN = 'Rfh192ozhicrSZ2R9bDX8uRvOu0';
var PROJECT_ID_DEV = '536e5455bba6150009000090';


/**
 * Create iron mq client instance
 */

var imq = new iron_mq.Client({
  token: TOKEN,
  project_id: PROJECT_ID_DEV
});


/**
 * setup 'automessge' queue on iron mq
 */

module.exports.automessage = imq.queue("automessage");


/**
 * setup 'usage' queue on iron mq
 */

module.exports.usage = imq.queue("usage");


/**
 * setup 'score' queue on iron mq
 */

module.exports.score = imq.queue("score");


/**
 * setup 'health' queue on iron mq
 */

module.exports.health = imq.queue("health");
