'use strict';

var shared = require('./karma.conf');

module.exports = function(config) {
  shared(config);

  config.set({
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,
    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS']
  });
};
