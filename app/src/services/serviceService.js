'use strict';

var logger = require('logger');
var pathToRegexp = require('path-to-regexp');
var Service = require('models/service');
var Filter = require('models/filter');
var Microservice = require('models/microservice');

class ServiceService {

    static * saveService(data){
        logger.debug('Saving service ', data);
        logger.debug('Removing old filter with same url %s', data.url);
        yield Filter.find({url: data.url, method: data.method}).remove().exec();

        let keys = [];
        let regex = pathToRegexp(data.url, keys);
        if(keys && keys.length > 0){
            keys = keys.map(function(key, i){
                return key.name;
            });
        }
        let service = yield new Service({
            id: data.id,
            name: data.name,
            url: data.url,
            urlRegex: regex,
            keys: keys,
            method: data.method,
            endpoints: data.endpoints,
            filters: data.filters
        }).save();

        if(data.dataProvider){
            logger.debug('Creating filter');
            let filter = {
                url: data.url,
                dataProvider: data.dataProvider,
                paramProvider: data.paramProvider,
                urlRegex: regex,
                keys: keys,
                method: data.method
            };
            if(data.filters){
                filter.filters = Object.keys(data.filters);
            }
            yield new Filter(filter).save();
        }

        logger.debug('Saving correct ', service);
        return service;
    }

    static * addDocMicroservice(data){
        logger.info('Registering in microservice collection');
        logger.debug('Removing old microservice with same id %s', data.id);
        yield Microservice.remove({id: data.id});

        yield new Microservice({
            id: data.id,
            swagger: data.swagger
        }).save();

    }

    static * registerMicroservices(data){
        logger.info('Saving services');
        var exist = yield Service.find({
            id: data.id
        }).exec();

        if (exist && exist.length > 0) {
            logger.debug('Service exist. Remove olds...');
            yield Service.find({
                id: data.id
            }).remove().exec();
            logger.debug('Remove correct.');
        }

        let services = [];
        if(data && data.urls){
            for(let i= 0, length = data.urls.length; i < length; i++){
                services.push(yield ServiceService.saveService({
                    id: data.id,
                    name: data.name,
                    url: data.urls[i].url,
                    method: data.urls[i].method,
                    endpoints: data.urls[i].endpoints,
                    filters: data.urls[i].filters,
                    dataProvider: data.urls[i].dataProvider,
                    paramProvider: data.urls[i].paramProvider
                }));

            }
        }

        yield ServiceService.addDocMicroservice(data);

        logger.info('Save correct');
        return services;
    }
}

module.exports = ServiceService;
