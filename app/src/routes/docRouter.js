'use strict';
var pathToRegexp = require('path-to-regexp');
var Router = require('koa-router');
var logger = require('logger');
var Microservice = require('models/microservice');
var YAML = require('yaml-js');
var config = require('config');

var router = new Router({
});


class DocRouter {

    static mergeDoc(principal, services, host){

        try{
            var swagger = Object.assign({}, principal.swagger);
            swagger.host = host;
            if(services){
                for(let i = 0, length = services.length; i < length; i++){
                    if(services[i].swagger){
                        if(services[i].swagger.paths){
                            swagger.paths = Object.assign(swagger.paths, services[i].swagger.paths);
                        }
                        if(services[i].swagger.definitions){
                            swagger.definitions = Object.assign(swagger.definitions, services[i].swagger.definitions);
                        }
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
        let filters = {id: {$ne: 'api-gateway'}};
        if(this.query.tag){
            logger.debug('Get by tag ', this.query.tag);
            filters.tags = { $in: [this.query.tag]};
            logger.debug('filters ', filters);
        }
        let microservices = yield Microservice.find(filters);
        let targetHost = config.get('server.publicUrl').replace('http://', '').replace('https://', '');
        this.body = DocRouter.mergeDoc(apiGatewayDoc, microservices, (this.query.host || targetHost));
    }

}

router.get('/swagger', DocRouter.getDoc);

module.exports = router;
