'use strict';

var logger = require('logger');
var pathToRegexp = require('path-to-regexp');
var Service = require('models/service');
var Filter = require('models/filter');

class ServiceService {

    static * saveService(data){
        logger.debug('Saving service ', data);
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
        logger.debug('Removing old filter with same url %s', data.url);
        yield Filter.find({url: data.url, method: data.method}).remove().exec();

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

    static * createServices(data){
        logger.info('Saving services');
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
        logger.info('Save correct');
        return services;
    }
}

module.exports = ServiceService;
