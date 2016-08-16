/**
 * Created by Thomas-P on 04.08.2016.
 */
// karma.conf.js
module.exports = function(config) {
    config.set({
        basePath: '',
        plugins: [ require('./test/tsc-preprocessor'), 'karma-jasmine', 'karma-chrome-launcher', 'karma-spec-reporter'],


        autoWatch: true,
        singleRun: false,
        frameworks: ['jasmine'],
        colors: true,
        concurrency: Infinity,



        files: [
            'node_modules/es6-shim/es6-shim.js',
            'node_modules/systemjs/dist/system.js',
            'test/karma-system.js',
            'node_modules/reflect-metadata/Reflect.js',
            {pattern: 'node_modules/rxjs/**/*.js', included: false},
            {pattern: 'src/**/**.ts', included: false},
            {pattern: 'test/**/*.Spec.ts', included: false}
        ],
        // list of files to exclude
        exclude: [
        ],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'test/**/*.Spec.ts': ['tsc'],
            'src/**/*.ts': ['tsc']
        },

        reporters: ['spec'],


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['Chrome'],

    });
};