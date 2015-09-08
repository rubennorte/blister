(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Blister = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
    provider.register(this);
    return this;
  },

  /**
   * Creates a new context for the current dependency injection container.
   * A context inherits all the dependencies of its parent container and can
   * define its own dependencies that shadow the ones of the container.
   * @return {BlisterContainer}
   */
  createContext: function() {
    var context = Object.create(BlisterContainer.prototype);
    context._deps = Object.create(this._deps);
    return context;
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

},{"./errors":2,"./wrappers":3}],2:[function(require,module,exports){
'use strict';

/**
 * Wrapper just to create new subclasses of Error without
 * executing its constructor (ES3-compatible)
 * @class
 * @private
 */
function ErrorWrapper() {}
ErrorWrapper.prototype = Error.prototype;

/**
 * @class
 * @extends {Error}
 * @param {string} [message='Values cannot be extended. Redefine them instead']
 * @private
 */
function IllegalExtensionError(message) {
  this.name = 'IllegalExtensionError';
  this.message = message || 'Values cannot be extended. Redefine them instead';
}

IllegalExtensionError.prototype = new ErrorWrapper();
IllegalExtensionError.constructor = IllegalExtensionError;

/**
 * @class
 * @extends {Error}
 * @param {string} [message='Cannot get an unregistered dependency']
 * @private
 */
function UnregisteredDependencyError(message) {
  this.name = 'UnregisteredDependencyError';
  this.message = message || 'Cannot get an unregistered dependency';
}

UnregisteredDependencyError.prototype = new ErrorWrapper();
UnregisteredDependencyError.constructor = UnregisteredDependencyError;

/**
 * @class
 * @extends {Error}
 * @param {string} [message='Cannot extend a dependency not previously set']
 * @private
 */
function UnregisteredExtendedDependencyError(message) {
  this.name = 'UnregisteredExtendedDependencyError';
  this.message = message || 'Cannot extend a dependency not previously set';
}

UnregisteredExtendedDependencyError.prototype = new ErrorWrapper();
UnregisteredExtendedDependencyError.constructor = UnregisteredExtendedDependencyError;

module.exports = {
  IllegalExtensionError: IllegalExtensionError,
  UnregisteredDependencyError: UnregisteredDependencyError,
  UnregisteredExtendedDependencyError: UnregisteredExtendedDependencyError
};

},{}],3:[function(require,module,exports){
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

},{}]},{},[1])(1)
});
//# sourceMappingURL=blister.js.map
