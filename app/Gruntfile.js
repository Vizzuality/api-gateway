'use strict';

module.exports = function (grunt) {

    grunt.file.setBase('..');
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({


        clean: {},
        jshint: {
            js: {
                src: [
                    'app/src/**/*.js'
                ],
                options: {
                    jshintrc: true
                },
                globals: {}
            },
            jsTest: {
                src: [
                    'app/test/**/*.js'
                ],
                options: {
                    jshintrc: true
                },
                globals: {}
            }
        },
        express: {
            dev: {
                options: {
                    script: 'app/index.js',
                    'node_env': 'dev',
                    port: process.env.PORT,
                    output: 'started'
                }
            }
        },

        mochaTest: {
            unit: {
                options: {
                    reporter: 'spec',
                    quiet: false, // Optionally suppress output to standard out (defaults to false)
                    clearRequireCache: true, // Optionally clear the require cache before running tests (defaults to false)
                    require: 'co-mocha'
                },
                src: ['app/test/unit/**/*.test.js']
            },
            e2e: {
                options: {
                    reporter: 'spec',
                    quiet: false, // Optionally suppress output to standard out (defaults to false)
                    clearRequireCache: true, // Optionally clear the require cache before running tests (defaults to false)

                },
                src: ['app/test/e2e/**/*.spec.js']
            }
        },
        watch: {
            options: {
                livereload: true
            },
            jssrc: {
                files: [
                    'app/src/**/*.js',
                ],
                tasks: ['jshint:js', 'mochaTest:unit', 'express:dev'],
                options: {
                    spawn: false
                }
            },
            unitTest: {
                files: [
                    'app/test/unit/**/*.test.js',
                ],
                tasks: ['jshint:jsTest', 'mochaTest:unit'],
                options: {
                    spawn: false
                }
            },
            e2eTest: {
                files: [
                    'app/test/unit/**/*.spec.js',
                ],
                tasks: ['jshint:jsTest', 'mochaTest:e2e'],
                options: {
                    spawn: false
                }
            },

        }
    });


    grunt.registerTask('unitTest', ['mochaTest:unit']);

    grunt.registerTask('e2eTest', ['express:dev', 'mochaTest:e2e']);

    grunt.registerTask('test', ['jshint', 'unitTest']);

    grunt.registerTask('serve', ['express:dev', 'watch']);

    grunt.registerTask('default', 'serve');

};
