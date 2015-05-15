'use strict';

var wrappers = {

  VALUE: function wrapValue(value) {
    return function() {
      return value;
    };
  },

  FACTORY: function wrapFactory(value, container) {
    return value.bind(container, container);
  },

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
 * Blister
 * @class
 */
function Blister() {
  this._deps = {};
}

Blister.prototype = {

  constructor: Blister,

  VALUE: 'VALUE',
  SINGLETON: 'SINGLETON',
  FACTORY: 'FACTORY',

  get: function(id) {
    var wrapper = this._deps[id];
    return wrapper && wrapper();
  },

  set: function(id, value, type) {
    if (typeof id !== 'string') {
      throw new TypeError('The dependency id must be a string: ' + id);
    }

    var typeOfValue = typeof value;
    if (!type) {
      type = (typeOfValue === 'function') ? this.SINGLETON : this.VALUE;
    }

    if (typeOfValue !== 'function' && type !== this.VALUE) {
      throw new TypeError('The value must be a function for types SINGLETON and FACTORY: ' + value);
    }

    this._deps[id] = wrappers[type](value, this);
    return this;
  },

  register: function(provider) {
    provider.register(this);
    return this;
  }

};

module.exports = Blister;
