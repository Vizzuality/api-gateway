'use strict';

var logger = require('logger');
var pathToRegexp = require('path-to-regexp');
var Service = require('models/service');

class ServiceService {

    static * saveService(data){
        logger.debug('Saving service');
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
        }).save();
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
                }));
            }
        }
        logger.info('Save correct');
        return services;
    }
}

module.exports = ServiceService;
