'use strict';
module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        clean: {},
        jshint: {
            js: {
                src: [
                    'src/**/*.js'
                ],
                options: {
                    jshintrc: true
                },
                globals: {}
            },
            // jsTest: {
            //     src: [
            //         'test/**/*.js'
            //     ],
            //     options: {
            //         jshintrc: true
            //     },
            //     globals: {}
            // }
        },
        express: {
            dev: {
                options: {
                    script: 'index.js',
                    'node_env': 'dev',
                    port: 8000,
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

                },
                src: ['test/unit/**/*.test.js']
            },
            e2e: {
                options: {
                    reporter: 'spec',
                    quiet: false, // Optionally suppress output to standard out (defaults to false)
                    clearRequireCache: true, // Optionally clear the require cache before running tests (defaults to false)

                },
                src: ['test/e2e/**/*.spec.js']
            }
        },
        watch: {
            options: {
                livereload: true
            },
            jssrc: {
                files: [
                    'src/**/*.js',
                ],
                tasks: ['jshint:js', 'mochaTest:unit', 'express:dev'],
                options: {
                    spawn: false
                }
            },
            unitTest: {
                files: [
                    'test/unit/**/*.test.js',
                ],
                tasks: ['jshint:jsTest', 'mochaTest:unit'],
                options: {
                    spawn: false
                }
            },
            e2eTest: {
                files: [
                    'test/unit/**/*.spec.js',
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
