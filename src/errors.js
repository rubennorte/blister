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
 * @param {string} [message='Cannot extend a dependency not previously set']
 * @private
 */
function MissingExtendedDependencyError(message) {
  this.name = 'MissingExtendedDependencyError';
  this.message = message || 'Cannot extend a dependency not previously set';
}

MissingExtendedDependencyError.prototype = new ErrorWrapper();
MissingExtendedDependencyError.constructor = MissingExtendedDependencyError;

module.exports = {
  IllegalExtensionError: IllegalExtensionError,
  MissingExtendedDependencyError: MissingExtendedDependencyError
};
