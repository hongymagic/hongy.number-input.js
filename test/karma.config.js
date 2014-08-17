// Karma configuration
// http://karma-runner.github.io/0.12/config/configuration-file.html

'use strict';

module.exports = function () {

	var isTeamCity = !!process.env.TEAMCITY_VERSION;

	return {
		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: false,

		// base path, that will be used to resolve files and exclude
		basePath: '../',

		// testing framework to use (jasmine/mocha/qunit/...)
		frameworks: ['jasmine'],

		// list of files / patterns to load in the browser
		files: [
			'components/jquery/dist/jquery.js',
			'components/angular/angular.js',
			'components/angular-mocks/angular-mocks.js',
			'src/**/*.js',
			'test/spec/**/*.js'
		],

		// list of files / patterns to exclude
		exclude: [],

		// web server port
		port: 9186,

		// Start these browsers, currently available:
		// - Chrome
		// - ChromeCanary
		// - Firefox
		// - Opera
		// - Safari (only Mac)
		// - PhantomJS
		// - IE (only Windows)
		browsers: [
			'PhantomJS'
		],

		// Which plugins to enable
		plugins: [
			'karma-chrome-launcher',
			'karma-phantomjs-launcher',
			'karma-jasmine',
			'karma-spec-reporter'
		],

		// Continuous Integration mode
		// if true, it capture browsers, run tests and exit
		singleRun: true,

		colors: true,

		reporters: isTeamCity ? ['teamcity'] : ['spec']
	};
};

