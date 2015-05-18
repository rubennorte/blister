'use strict';

var wrappers = require('./wrappers');

/**
 * @name BlisterDependencyType
 * @enum {string}
 *
 * @property {string} VALUE
 * @property {string} SINGLETON
 * @property {string} FACTORY
 */

var VALUE = 'VALUE';
var SINGLETON = 'SINGLETON';
var FACTORY = 'FACTORY';

/**
 * Dependency injection container constructor
 *
 * @example
 * var container = new BlisterContainer();
 * container.set('id', 'value');
 * container.get('id'); //> 'value';
 *
 * @class
 */
function BlisterContainer() {
  this._deps = {};
}

BlisterContainer.prototype = {

  constructor: BlisterContainer,

  /**
   * Type for VALUE dependencies.
   * It is the default type for dependencies specified as primitives: strings,
   * numbers, booleans, etc.
   *
   * @constant {string}
   */
  VALUE: VALUE,

  /**
   * Type for SINGLETON dependencies.
   * It is the default type for dependencies specified as functions
   *
   * @constant {string}
   */
  SINGLETON: SINGLETON,

  /**
   * Type for FACTORY dependencies
   *
   * @constant {string}
   */
  FACTORY: FACTORY,

  /**
   * Returns the dependency set with the given id,
   * or undefined if it is not present
   * @param  {string} id
   * @return {*}
   */
  get: function(id) {
    var wrapper = this._deps[id];
    return wrapper && wrapper();
  },

  /**
   * Registers the specified dependency in the container with the given type.
   *
   * If no type is passed, the default is SINGLETON for functions and
   * VALUE for others.
   * If the type is VALUE, the given value is returned each time the dependency
   * is requested.
   * If the type is SINGLETON, the given function will be called the first time
   * the dependency is requested. The value is returned and cached for the
   * subsequent calls.
   * If the type is FACTORY, the given function is called each time the
   * dependency is requested.
   *
   * @param {string} id The dependency id
   * @param {*|Function} [value] The dependency definition
   * @param {BlisterDependencyType} [type] VALUE, SINGLETON or FACTORY
   *                                       properties
   * @return {BlisterContainer} The container itself
   */
  set: function(id, value, type) {
    return this._set(id, value, type);
  },

  /**
   * Extends the specified dependency in the container with the given type.
   *
   * If no type is passed, inherits the original type if it is a function or
   * it is defined as VALUE otherwise.
   *
   * @param {string} id The dependency id
   * @param {*|Function} [value] The dependency definition
   * @param {BlisterDependencyType} [type] VALUE, SINGLETON or FACTORY
   *                                       properties
   * @return {BlisterContainer} The container itself
   */
  extend: function(id, value, type) {
    if (!this._deps[id]) {
      throw new Error('Cannot extend a dependency not previously set: ' + id);
    }

    return this._set(id, value, type, true);
  },

  /**
   * Internal dependency setter that adds extension support
   *
   * @private
   * @param {string} id The dependency id
   * @param {*|Function} [value] The dependency definition
   * @param {BlisterDependencyType} [type] VALUE, SINGLETON or FACTORY
   *                                       properties
   * @param {boolean} isExtension Determines if extends a previous dependency,
   *                              so the original value is stored and passed to
   *                              the new definition
   * @return {BlisterContainer} The container itself
   */
  _set: function(id, value, type, isExtension) {
    if (typeof id !== 'string') {
      throw new TypeError('The dependency id must be a string: ' + id);
    }

    var originalWrapper = isExtension ? this._deps[id] : undefined;

    var typeOfValue = typeof value;
    if (!type) {
      if (typeOfValue !== 'function') {
        type = VALUE;
      } else if (isExtension) {
        type = originalWrapper.type;
      } else {
        type = SINGLETON;
      }
    }

    if (typeOfValue !== 'function' && type !== VALUE) {
      throw new TypeError(
        'The value must be a function for types SINGLETON and FACTORY: ' +
        value);
    }

    this._deps[id] = wrappers.create(type, value, this, originalWrapper);
    return this;
  },

  /**
   * Calls register on the given service provider to register its dependencies
   * @param  {BlisterServiceProvider} provider
   * @return {BlisterContainer} the container itself
   */
  register: function(provider) {
    provider.register(this);
    return this;
  }

};

/**
 * Interface for service providers to use with BlisterContainer instances
 *
 * @interface BlisterServiceProvider
 *
 * @example
 *
 * // @implements {BlisterServiceProvider}
 * var provider = {
 *  register: function(container) {
 *    container.set('protocol', 'http://');
 *    container.set('host', 'example.com');
 *  }
 * };
 *
 * var container = new BlisterContainer();
 * container.register(provider);
 */

/**
 * @function
 * @name BlisterServiceProvider#register
 * @description Registers an indeterminate number of dependencies in the passed
 *              container
 * @param {BlisterContainer} container
 */

module.exports = BlisterContainer;
