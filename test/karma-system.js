// Tun on full stack traces in errors to help debugging
Error.stackTraceLimit=Infinity;

jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;

// Cancel Karma's synchronous start,
// we will call `__karma__.start()` later, once all the specs are loaded.
__karma__.loaded = function() {};

System.config({
    baseURL: '/base/',
    //transpiler: 'typescript',
    map: {
        //'typescript': 'node_modules/typescript/lib/typescript.js',
        'reflect-metadata': 'node_modules/reflect-metadata/Reflect.js',
        'src': 'src/',
        'test': 'test/'
    },
    packages: {
        'src': {
            defaultExtension: 'js'
        },
        'test': {
            defaultExtension: 'js',
            main: 'src/index.Spec'
        }
    }
});

// Import all the specs, execute their `main()` method and kick off Karma (Jasmine).
System
    .import('test')
    .catch(function(err){
        console.log(err);
    })
    .then(function() {
        __karma__.start();
    }, function(error) {
        __karma__.error(error.stack || error);
    });

