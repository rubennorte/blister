'use strict';

var wrappers = require('./wrappers');
var errors = require('./errors');

var IllegalExtensionError = errors.IllegalExtensionError;
var MissingExtendedDependencyError = errors.MissingExtendedDependencyError;

var VALUE = 'value';
var SINGLETON = 'singleton';
var FACTORY = 'factory';

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
  this._deps = {};
}

BlisterContainer.IllegalExtensionError = IllegalExtensionError;
BlisterContainer.MissingExtendedDependencyError = MissingExtendedDependencyError;

BlisterContainer.prototype = {

  constructor: BlisterContainer,

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
   * Registers the given singleton function with the specified id
   * @param  {string} id
   * @param  {Function} singletonFn
   * @return {BlisterContainer} this
   * @throws {TypeError} If id is not a string
   * @throws {TypeError} If singletonFn is not a function
   */
  singleton: function(id, singletonFn) {
    return this._set(id, singletonFn, SINGLETON, false);
  },

  /**
   * Extends a previously defined dependency with the same type:
   * factory or singleton
   * @param  {string} id
   * @param  {Function} definition
   * @return {BlisterContainer} this
   * @throws {TypeError} If id is not a string
   * @throws {TypeError} If definition is not a function
   * @throws {MissingExtendedDependencyError} If there was not a previously
   *         defined dependency with that id
   * @throws {IllegalExtensionError} If trying to extend a dependency
   *         registered as value
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
   */
  _set: function(id, value, type, isExtension) {
    if (typeof id !== 'string') {
      throw new TypeError('The dependency id must be a string: ' + id);
    }

    var originalWrapper = isExtension ? this._deps[id] : undefined;
    if (isExtension) {
      if (!originalWrapper) {
        throw new MissingExtendedDependencyError();
      }
      type = originalWrapper.type;
    }

    if (typeof value !== 'function' && type !== VALUE) {
      throw new TypeError(
        'The argument must be a function: ' +
        value);
    }

    if (type === VALUE && isExtension) {
      throw new IllegalExtensionError();
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
