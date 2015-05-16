'use strict';

/**
 * Wrapper functions to store the different types of dependencies in the
 * container
 * @private
 * @type {Object}
 */
var wrappers = {

  /**
   * Returns a wrapper for a VALUE dependency to be stored in the container
   * @param {*} value
   * @return {Function}
   */
  VALUE: function wrapValue(value) {
    return function() {
      return value;
    };
  },

  /**
   * Returns a wrapper for a FACTORY dependency to be stored in the container
   * @param {Function} value The factory function
   * @param {BlisterContainer} container
   * @param {Function} [originalWrapper]
   * @return {Function}
   */
  FACTORY: function wrapFactory(value, container, originalWrapper) {
    return function() {
      var originalValue = originalWrapper && originalWrapper();
      return value.call(container, container, originalValue);
    };
  },

  /**
   * Returns a wrapper for a SINGLETON dependency to be stored in the container
   * @param {Function} value The singleton generator function
   * @param {BlisterContainer} container
   * @param {Function} [originalWrapper]
   * @return {Function}
   */
  SINGLETON: function wrapSingleton(value, container, originalWrapper) {
    var cached = false;
    var cachedValue;
    return function() {
      var originalValue;
      if (!cached) {
        cached = true;
        originalValue = originalWrapper && originalWrapper();
        cachedValue = value.call(container, container, originalValue);
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
