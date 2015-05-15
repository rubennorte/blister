'use strict';

/**
 * Blister
 * @class
 * @param {Object} [options={}] Some options
 */
function Blister(options) {
  options = options || {};
}

Blister.prototype = {

  constructor: Blister,

  /**
   * Processes some stuff.
   * @param {string} what Wat?!
   * @return {boolean}
   */
  process: function(what) {
    return !!what;
  }

};

module.exports = Blister;
