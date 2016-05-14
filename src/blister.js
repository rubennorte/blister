'use strict';

var wrappers = require('./wrappers');
var errors = require('./errors');

var IllegalExtensionError = errors.IllegalExtensionError;
var UnregisteredDependencyError = errors.UnregisteredDependencyError;
var UnregisteredExtendedDependencyError = errors.UnregisteredExtendedDependencyError;

var VALUE = 'value';
var SINGLETON = 'singleton';
var FACTORY = 'factory';

/**
 * @private
 * @param  {*} id
 * @throws {TypeError} If the passed id is not a string
 */
function checkId(id) {
  if (typeof id !== 'string') {
    throw new TypeError('The dependency id must be a string: ' + id);
  }
}

/**
 * Dependency injection container constructor
 *
 * @example
 * var container = new BlisterContainer();
 * container.value('id', 'value');
 * container.get('id'); //> 'value';
 *
 * @class
 */
function BlisterContainer() {
  this._deps = Object.create(null);
}

BlisterContainer.IllegalExtensionError = IllegalExtensionError;
BlisterContainer.UnregisteredDependencyError = UnregisteredDependencyError;
BlisterContainer.UnregisteredExtendedDependencyError = UnregisteredExtendedDependencyError;

BlisterContainer.prototype = {

  constructor: BlisterContainer,

  /**
   * Indicates if there is a registered dependency with the given id
   * @param  {string} id
   * @return {boolean}
   * @throws {TypeError} If the id is not a string
   */
  has: function(id) {
    checkId(id);
    return id in this._deps;
  },

  /**
   * Returns a list with all the keys available in the container
   * @return {string[]}
   */
  keys: function() {
    var keys = [];
    /* eslint guard-for-in: 0 */
    for (var i in this._deps) {
      // No need for Object.hasOwnProperty here as deps prototype is null
      keys.push(i);
    }
    return keys;
  },

  /**
   * Returns the dependency set with the given id,
   * or undefined if it is not present
   * @param  {string} id
   * @return {*}
   */
  get: function(id) {
    checkId(id);

    if (!this.has(id)) {
      throw new UnregisteredDependencyError('Cannot get unregistered dependency ' + id);
    }

    return this._deps[id].call(this);
  },

  /**
   * Registers the given value with the specified id
   * @param  {string} id
   * @param  {*} value
   * @return {BlisterContainer} this
   * @throws {TypeError} If id is not a string
   */
  value: function(id, value) {
    return this._set(id, value, VALUE, false);
  },

  /**
   * Registers the given factory function with the specified id
   * @param  {string} id
   * @param  {Function} factoryFn
   * @return {BlisterContainer} this
   * @throws {TypeError} If id is not a string
   * @throws {TypeError} If factoryFn is not a function
   */
  factory: function(id, factoryFn) {
    return this._set(id, factoryFn, FACTORY, false);
  },

  /**
   * Registers the given service function with the specified id
   * @param  {string} id
   * @param  {Function} serviceFn
   * @return {BlisterContainer} this
   * @throws {TypeError} If id is not a string
   * @throws {TypeError} If serviceFn is not a function
   */
  service: function(id, serviceFn) {
    return this._set(id, serviceFn, SINGLETON, false);
  },

  /**
   * Extends a previously defined dependency with the same type:
   * service or factory
   * @param  {string} id
   * @param  {Function} definition
   * @return {BlisterContainer} this
   * @throws {TypeError} If id is not a string
   * @throws {TypeError} If definition is not a function
   * @throws {UnregisteredExtendedDependencyError} If there was not a previously
   *         defined dependency with that id
   */
  extend: function(id, definition) {
    return this._set(id, definition, undefined, true);
  },

  /**
   * Internal dependency setter that adds extension support
   *
   * @private
   * @param {string} id The dependency id
   * @param {*|Function} value The dependency definition
   * @param {string} 'VALUE', 'SINGLETON' or 'FACTORY'
   * @param {boolean} isExtension Determines if extends a previous dependency,
   *                              so the original value is stored and passed to
   *                              the new definition
   * @return {BlisterContainer} The container itself
   * @throws {TypeError} If the id is not a string
   * @throws {TypeError} If value is not a function when the type is
   *         'SINGLETON' or 'FACTORY'
   * @throws {UnregisteredExtendedDependencyError} When trying to extend an
   *         unregistered dependency
   */
  _set: function(id, value, type, isExtension) {
    checkId(id);

    var originalWrapper = isExtension ? this._deps[id] : undefined;
    if (isExtension) {
      if (!originalWrapper) {
        throw new UnregisteredExtendedDependencyError();
      }

      /* eslint no-param-reassign: 0 */
      type = originalWrapper.type;
      if (type === VALUE) {
        type = SINGLETON;
      }
    }

    if (typeof value !== 'function' && (isExtension || type !== VALUE)) {
      throw new TypeError('The argument must be a function: ' + value);
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
    if (typeof provider === 'function') {
      provider(this);
    } else {
      provider.register(this);
    }
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
