'use strict';

module.exports = function(config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '..',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      'gen/unit-test-bundle.js'
    ],

    // list of files to exclude
    exclude: [],

    preprocessors: {
      '**/*.js': ['sourcemap']
    },

    reportSlowerThan: 50,

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'verbose', 'junit'],
    junitReporter: {
      outputFile: 'output/unit-test-results.xml'
    },

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE ||
    // config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    customLaunchers: {
      /*X:
			{
				base: '',
				flags: []
			}*/
    }
  });
};
