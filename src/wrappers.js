'use strict';

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
   * @param {BlisterContainer} container
   * @param {Function} [originalWrapper]
   * @return {Function}
   */
  factory: function wrapFactory(value, container, originalWrapper) {
    return function() {
      if (originalWrapper) {
        return value.call(this, originalWrapper(), this);
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
  singleton: function wrapSingleton(value, container, originalWrapper) {
    var cached = false;
    var cachedValue;
    return function() {
      if (!cached) {
        if (originalWrapper) {
          cachedValue = value.call(container, originalWrapper(), container);
        } else {
          cachedValue = value.call(container, container);
        }
        cached = true;
        /* eslint no-param-reassign: 0 */
        value = null;
      }
      return cachedValue;
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
