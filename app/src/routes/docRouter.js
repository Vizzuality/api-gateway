'use strict';
var pathToRegexp = require('path-to-regexp');
var Router = require('koa-router');
var logger = require('logger');
var Microservice = require('models/microservice');
var YAML = require('yaml-js');

var router = new Router({
});


class DocRouter {

    static mergeDoc(principal, services){

        try{
            var swagger = Object.assign({}, principal.swagger);

            if(services){
                for(let i = 0, length = services.length; i < length; i++){
                    logger.debug(services[i].swagger.paths);
                    if(services[i].swagger.paths){
                        swagger.paths = Object.assign(swagger.paths, services[i].swagger.paths);
                    }
                    if(services[i].swagger.definitions){
                        swagger.definitions = Object.assign(swagger.definitions, services[i].swagger.definitions);
                    }
                }
            }
            return swagger;
        }catch(e){
            logger.error(e);
        }
    }

    static * getDoc(){
        logger.info('Obtaining doc');
        let apiGatewayDoc = yield Microservice.findOne({id:'api-gateway'});
        let microservices = yield Microservice.find({id: {$ne: 'api-gateway'}});
        this.body = DocRouter.mergeDoc(apiGatewayDoc, microservices);
    }

}

router.get('/swagger', DocRouter.getDoc);

module.exports = router;
