// this module returns an object of variables that will be passed as locals
// to render the body/subject of an automessage / manual message

/**
 * npm dependencies
 */

var _ = require('lodash');



/**
 * The 'meta' array must have been converted toObject before calling this function
 * The 'email' and 'user_id' are passed alongwith the all the metadata keys
 *
 * INPUT:
 *
    user: {
      _id: 42389472398472839,
      user_id: 'prateekbhatt',
      email: 'prattbhatt@gmail.com',
      meta: {
        name: 'Prateek',
        status: 'Free',
        amount: 49
      }
    }
 *
 * OUTPUT:
 *
    user: {
      email: 'prattbhatt@gmail.com',
      user_id: 'prateekbhatt',
      name: 'Prateek',
      status: 'Free',
      amount: 49
    }
 *
 *
 */

function getRenderData(user) {

  // if user is in BSON format, convert it into JSON
  if (user.toJSON) {
    user = user.toJSON();
  }

  var meta = user.meta;

  if (_.isArray(meta)) {
    throw new Error('getRenderData "user.meta" must be an object');
  }

  // add the email and user_id properties to the meta object
  meta.email = user.email;
  meta.user_id = user.user_id;

  var locals = {
    user: meta
  };

  return locals;

}


module.exports = getRenderData;
