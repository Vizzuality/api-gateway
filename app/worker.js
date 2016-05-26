var fs = require('fs');
var logger = require('logger');
var config = require('config');
var co = require('co');
var ServiceService = require('services/serviceService');

fs.watch(process.argv[2], function(){
    co(function *(){
        let content = fs.readFileSync(process.argv[2]);
        yield ServiceService.updateService(JSON.parse(content));
    }).then(function(){
        logger.info('Updated correct');
    }, function(err){
        logger.error('Error updating', err);
    });
});
