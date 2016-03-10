'use strict';

var logger = require('logger');
var url = require('url');
var config = require('config');
var pathToRegexp = require('path-to-regexp');
var Service = require('models/service');
var ServiceNotFound = require('errors/serviceNotFound');


class DispatcherService {

    static * buildUrl(sourceUrl, targetUrl, service) {
        logger.debug('Building url');
        var result = service.urlRegex.exec(sourceUrl);
        let keys = {};
        service.keys.map(function(key, i){
            keys[key] = result[i + 1];
        });
        let toPath = pathToRegexp.compile(targetUrl);
        let buildUrl = toPath(keys);
        logger.debug('Final url ' + buildUrl);
        return buildUrl;
    }

    static * getRequests(sourceUrl, sourceMethod, body){
        logger.debug('Obtaining config request');
        var requests = [];
        var parsedUrl = url.parse(sourceUrl);
        var service = yield Service.findOne({
            $where: 'this.urlRegex && this.urlRegex.test(\'' + parsedUrl.pathname + '\')',
            method: sourceMethod
        });
        logger.debug(service);
        let configRequest = null;
        if(service && service.endpoints) {
            for(let i = 0, length = service.endpoints.length; i < length; i++){
                let endpoint = service.endpoints[i];
                logger.info('Dispathing request from %s to %s%s private endpoint. Type: %s', parsedUrl.pathname, endpoint.baseUrl, endpoint.path, endpoint.type);

                let url = yield DispatcherService.buildUrl(parsedUrl.pathname, endpoint.path, service);
                configRequest = {
                    uri: endpoint.baseUrl + url,
                    method: endpoint.method,
                    json: true
                };
                logger.debug('Create request to %s', endpoint.baseUrl + url);
                if(endpoint.method === 'POST' || endpoint.method === 'PATCH' || endpoint.method === 'PUT'){
                    logger.debug('Method is %s. Adding body', configRequest.method);
                    configRequest.body = body;
                }
                requests.push(configRequest);
            }
            return requests;
        } else  {
            logger.debug('Redirect to old API');
            configRequest = {
                uri: config.get('oldAPI.url') + sourceUrl,
                method: sourceMethod,
                json:true
            };
            logger.debug('Create request to %s', config.get('oldAPI.url') + sourceUrl);
            if(configRequest.method === 'POST' && configRequest.method === 'PATCH' &&configRequest.method === 'PUT'){
                logger.debug('Method is %s. Adding body', configRequest.method);
                configRequest.body = body;
            }
            requests.push(configRequest);
            return requests;
            // throw new ServiceNotFound('Not found services to url:' + sourceUrl);
        }
    }
}

module.exports = DispatcherService;
