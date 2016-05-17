'use strict';

var logger = require('logger');
var pathToRegexp = require('path-to-regexp');
var Service = require('models/service');
var Filter = require('models/filter');
var Microservice = require('models/microservice');
var crypto = require('crypto');

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

    static * addDataMicroservice(data) {
        logger.info('Registering in microservice collection');
        logger.debug('Removing old microservice with same id %s', data.id);
        yield Microservice.remove({
            id: data.id
        });

        var microservice = yield new Microservice({
            id: data.id,
            swagger: data.swagger,
            token: crypto.randomBytes(20).toString('hex')
        }).save();
        return microservice;
    }

    static * registerMicroservices(data, url) {
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

        let microservice = yield ServiceService.addDataMicroservice(data);

        logger.info('Save correct');
        return microservice;
    }
}

module.exports = ServiceService;
