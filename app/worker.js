'use strict';

var fs = require('fs');
var logger = require('logger');
var config = require('config');
var co = require('co');
var ServiceService = require('services/serviceService');
var mongoose = require('mongoose');
var mongoUri = 'mongodb://' + config.get('mongodb.host') + ':' + config.get('mongodb.port') + '/' + config.get('mongodb.database');

logger.info('Watching %s file', process.argv[2]);

var onDbReady = function(err) {
    if(process.env.NODE_ENV !== 'dev'){
        let inProcess = false;
        fs.watch(process.argv[2], function(){
            if(!inProcess){
                inProcess=true;
                logger.info('Change detected');
                setTimeout(function(){
                    co(function *(){
                        let content = fs.readFileSync(process.argv[2]);
                        yield ServiceService.updateMicroservices(JSON.parse(content));
                    }).then(function(){
                        logger.info('Updated correct');
                        process.exit(0); //the process restart by pm2
                    }, function(err){
                        logger.error('Error updating', err);
                        process.exit(0); //the process restart by pm2
                    });
                }, 5000);
            }
        });
    } else {
        co(function *(){
            let content = fs.readFileSync(process.argv[2]);
            yield ServiceService.updateMicroservices(JSON.parse(content));
        }).then(function(){
            logger.info('Updated correct');
            process.exit(0); //the process restart by pm2
        }, function(err){
            logger.error('Error updating', err);
            process.exit(0); //the process restart by pm2
        });
    }
};

mongoose.connect(mongoUri, onDbReady);
