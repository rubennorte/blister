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
   * @param {BlisterContainer} container The container to use as argument and
   *                                     context for the factory
   */
  FACTORY: function wrapFactory(value, container) {
    return value.bind(container, container);
  },

  /**
   * Returns a wrapper for a SINGLETON dependency to be stored in the container
   * @param {Function} value The singleton generator function
   * @param {BlisterContainer} container The container to use as argument and
   *                                     context for the factory
   */
  SINGLETON: function wrapSingleton(value, container) {
    var cached = false;
    var cachedValue;
    return function() {
      if (!cached) {
        cached = true;
        cachedValue = value.call(container, container);
        value = null;
      }
      return cachedValue;
    };
  }

};

/**
 * @name BlisterDependencyType
 * @description Possible dependency types to register in a BlisterContainer.
 *               These constants are available as properties of all instances.
 * @enum {string}
 * @property {string} VALUE
 * @property {string} FACTORY
 * @property {string} SINGLETON
 */

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
  VALUE: 'VALUE',

  /**
   * Type for SINGLETON dependencies.
   * It is the default type for dependencies specified as functions
   *
   * @constant {string}
   */
  SINGLETON: 'SINGLETON',

  /**
   * Type for FACTORY dependencies
   *
   * @constant {string}
   */
  FACTORY: 'FACTORY',

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
   *                                       properties of a BlisterContainer
   * @return {BlisterContainer} The container itself
   */
  set: function(id, value, type) {
    if (typeof id !== 'string') {
      throw new TypeError('The dependency id must be a string: ' + id);
    }

    var typeOfValue = typeof value;
    if (!type) {
      type = (typeOfValue === 'function') ? this.SINGLETON : this.VALUE;
    }

    if (typeOfValue !== 'function' && type !== this.VALUE) {
      throw new TypeError(
        'The value must be a function for types SINGLETON and FACTORY: ' +
        value);
    }

    this._deps[id] = wrappers[type](value, this);
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
