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
