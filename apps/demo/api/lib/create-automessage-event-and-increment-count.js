
/**
 * Models
 */

var AutoMessage = require('../models/AutoMessage');
var Event = require('../models/Event');


/**
 * Create an automessage event: sent/seen/clicked/replied
 *
 * if the event was created first time for the automessage by the user then
 * increment count of sent/seen/clicked/replied of automessage
 *
 * @param  {object}   ids
 *         @property {string} aid app-id
 *         @property {string} amId automessage-id
 *         @property {string} uid user-id
 * @param  {string}   state sent/seen/clicked/replied
 * @param  {string}   title title-of-the-automessage
 * @param  {Function} cb    callback
 */
function createEventAndIncrementCount(ids, state, title, cb) {

  Event.automessage(ids, state, title, function (err, updatedExisting) {

    if (err) return cb(err);

    // if this automessage event has occurred before by the same user,
    // then move on
    if (updatedExisting) return cb();

    // else increment the count by 1
    AutoMessage.incrementCount(ids.amId, state, cb);
  });
}

module.exports = createEventAndIncrementCount;
