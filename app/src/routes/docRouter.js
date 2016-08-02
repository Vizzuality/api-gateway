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

    static mergeDoc(principal, services, host, title, description){

        try{
            var swagger = Object.assign({}, principal.swagger);
            swagger.host = host;
            if(title){
                swagger.info.title = title;
            }
            if(description){
                swagger.info.description = description;
            }
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
        let title = null;
        let description = null;
        if(this.query.tag){
            filters.tags = { $in: [this.query.tag]};
            if(this.query.tag === 'gfw'){
                title = 'Global Forest Watch API';
                description = 'API Documentation of Global Forest Watch project';
            } else if(this.query.tag === 'rw'){
                title = 'Resource Watch API';
                description = 'API Documentation of Resource Watch project';
            }
        }
        let microservices = yield Microservice.find(filters);
        let targetHost = config.get('server.publicUrl').replace('http://', '').replace('https://', '');
        this.body = DocRouter.mergeDoc(apiGatewayDoc, microservices, (this.query.host || targetHost), title, description);
    }

}

router.get('/swagger', DocRouter.getDoc);

module.exports = router;
