'use strict';

var logger = require('logger');
var pathToRegexp = require('path-to-regexp');
var Service = require('models/service');
var Filter = require('models/filter');
var Microservice = require('models/microservice');
var restCo = require('lib/restCo');
var crypto = require('crypto');
var config = require('config');

class ServiceService {

    static * saveService(data) {
        logger.debug('Saving service ', data);
        logger.debug('Removing old filter with same url %s', data.url);
        yield Filter.remove({
            url: data.url,
            method: data.method
        });

        let keys = [];
        let regex = pathToRegexp(data.url, keys);
        if (keys && keys.length > 0) {
            keys = keys.map(function(key, i) {
                return key.name;
            });
        }
        let service = yield new Service({
            id: data.id,
            name: data.name,
            url: data.url,
            urlRegex: regex,
            authenticated: data.authenticated !== undefined ? data.authenticated : false,
            keys: keys,
            method: data.method,
            endpoints: data.endpoints,
            filters: data.filters
        }).save();

        if (data.dataProvider) {
            logger.debug('Creating filter');
            let filter = {
                url: data.url,
                dataProvider: data.dataProvider,
                paramProvider: data.paramProvider,
                urlRegex: regex,
                keys: keys,
                method: data.method
            };
            if (data.filters) {
                filter.filters = Object.keys(data.filters);
            }
            yield new Filter(filter).save();
        }

        logger.debug('Saving correct ', service);
        return service;
    }

    static * addDataMicroservice(data, token) {
        logger.info('Registering in microservice collection');
        logger.debug('Removing old microservice with same id %s', data.id);
        yield Microservice.remove({
            id: data.id
        });

        var microservice = yield new Microservice({
            id: data.id,
            swagger: data.swagger,
            token: token || 'invalid'
        }).save();
        return microservice;
    }

    static * registerMicroservices(data, url, token) {
        logger.info('Saving services');
        var exist = yield Service.find({
            id: data.id
        });

        if (exist && exist.length > 0) {
            logger.debug('Service exist. Remove olds...');
            yield Service.remove({
                id: data.id
            });
            //search by url. if not exist more services with same url (service removed), remove filters by same url
            for (let i = 0, length = exist.length; i < length; i++) {
                let services = yield Service.find({
                    url: exist[i].url,
                    method: exist[i].method
                });
                if (!services || services.length === 0) {
                    logger.debug('Removing filter to url: ', exist[i].url, ' and method: ', exist[i].method);
                    yield Filter.remove({
                        url: exist[i].url,
                        method: exist[i].method
                    });
                }
            }
            logger.debug('Remove correct.');
        }

        let services = [];
        if (data && data.urls) {

            for (let i = 0, length = data.urls.length; i < length; i++) {
                if (data.urls[i].endpoints) {
                    for( let j=0, lengthEndpoints = data.urls[i].endpoints.length; j < lengthEndpoints; j++){
                        data.urls[i].endpoints[j].baseUrl = url;
                    }
                }
                services.push(yield ServiceService.saveService({
                    id: data.id,
                    name: data.name,
                    url: data.urls[i].url,
                    method: data.urls[i].method,
                    endpoints: data.urls[i].endpoints,
                    authenticated: data.urls[i].authenticated,
                    filters: data.urls[i].filters,
                    dataProvider: data.urls[i].dataProvider,
                    paramProvider: data.urls[i].paramProvider
                }));

            }
        }

        let microservice = yield ServiceService.addDataMicroservice(data, token);

        logger.info('Save correct');
        return microservice;
    }

    static * unregisterAll(){
        logger.info('Unregistering all services');
        var remove = yield Service.remove({});
        yield Filter.remove({});
        yield Microservice.remove({id: {$ne: 'api-gateway'}});
        return remove;
    }

    static * updateMicroservices(microservices){

        yield ServiceService.unregisterAll();
        for (let i=0, length = microservices.length; i < length; i++){
            if(microservices[i].host){
                try{
                    logger.debug('Doing request to ' + microservices[i].host + ':' + microservices[i].port);
                    let url = 'http://' + microservices[i].host + ':' + microservices[i].port;
                    let token = crypto.randomBytes(20).toString('hex');
                    let result = yield restCo({
                        uri: url + '/info?token=' +token + '&url='+config.get('server.internalUrl'),
                        method: 'GET'
                    });
                    if(result.response.statusCode === 200){
                        logger.debug('Registering microservice');
                        yield ServiceService.registerMicroservices(result.body, url, token);
                    }
                }catch(e){
                    logger.error(e);
                }
            }
        }

    }
}

module.exports = ServiceService;
