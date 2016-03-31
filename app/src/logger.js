'use strict';
var config = require('config');
var bunyan = require('bunyan');
/**
 * Create Logger
 */
module.exports = (function() {
    var streams = [{
        level: config.get('logger.level') || 'debug',
        stream: process.stdout
    }];
    if(config.get('logger.toFile')){
        streams.push({
            level: config.get('logger.level') || 'debug',
            path: config.get('logger.dirLogFile')
        });
    }
    var logger = bunyan.createLogger({
        name: config.get('logger.name'),
        streams: streams
    });
    return logger;

}());
