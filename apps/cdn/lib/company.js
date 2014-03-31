
var debug = require('debug')('dodatado:company');
var Entity = require('./entity');
var inherit = require('inherit');
var bind = require('bind');


/**
 * Company defaults
 */

Company.defaults = {
  persist: true,
  cookie: {
    key: 'dodatado_company_id'
  },
  localStorage: {
    key: 'dodatado_company_properties'
  }
};


/**
 * Initialize a new `Company` with `options`.
 *
 * @param {Object} options
 */

function Company (options) {
  this.defaults = Company.defaults;
  this.debug = debug;
  Entity.call(this, options);
}


/**
 * Inherit `Entity`
 */

inherit(Company, Entity);


/**
 * Expose the company singleton.
 */

module.exports = bind.all(new Company());


/**
 * Expose the `Company` constructor.
 */

module.exports.Company = Company;
