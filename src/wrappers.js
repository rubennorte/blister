'use strict';

var count = 0;

/**
 * Creates a process-wide unique service id
 * @private
 * @return {string}
 */
function createServiceId() {
  count++;
  return 'service-' + count;
}

/**
 * Wrapper functions to store the different types of dependencies in the
 * container
 * @private
 * @type {Object}
 */
var wrappers = {

  /**
   * Returns a wrapper for a value dependency to be stored in the container
   * @param {*} value
   * @return {Function}
   */
  value: function wrapValue(value) {
    return function() {
      return value;
    };
  },

  /**
   * Returns a wrapper for a factory dependency to be stored in the container
   * @param {Function} value The factory function
   * @param {Function} [originalWrapper]
   * @return {Function}
   */
  factory: function wrapFactory(value, originalWrapper) {
    return function() {
      if (originalWrapper) {
        return value.call(this, originalWrapper.call(this), this);
      }
      return value.call(this, this);
    };
  },

  /**
   * Returns a wrapper for a singleton dependency to be stored in the container
   * @param {Function} value The singleton generator function
   * @param {BlisterContainer} container
   * @param {Function} [originalWrapper]
   * @return {Function}
   */
  singleton: function wrapSingleton(value, originalWrapper) {
    var serviceId = createServiceId();
    return function() {
      var service = this._cache[serviceId];
      if (!service) {
        if (originalWrapper) {
          service = value.call(this, originalWrapper.call(this), this);
        } else {
          service = value.call(this, this);
        }
        this._cache[serviceId] = service;
      }
      return service;
    };
  },

  /**
   * Returns a wrapper for the given parameters
   * @param  {BlisterDependencyType} type
   * @param  {*|Function} value
   * @param  {BlisterContainer} container
   * @param  {Function} [originalWrapper]
   * @return {Function}
   */
  create: function(type, value, container, originalWrapper) {
    var wrapper = this[type](value, container, originalWrapper);
    wrapper.type = type;
    return wrapper;
  }

};

module.exports = wrappers;
