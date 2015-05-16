
'use strict';

var blisterDependencyTypes = {

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
  FACTORY: 'FACTORY'

};

module.exports = blisterDependencyTypes;
