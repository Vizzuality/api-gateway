'use strict';

var logger = require('logger');
var url = require('url');
var config = require('config');
var pathToRegexp = require('path-to-regexp');
var Service = require('models/service');
var Filter = require('models/filter');
var ServiceNotFound = require('errors/serviceNotFound');
var NotAuthorized = require('errors/notAuthorized');
var rest = require('restler');
var restCo = require('lib/restCo');


class DispatcherService {

    static * buildUrl(sourceUrl, targetUrl, service) {
        logger.debug('Building url');
        var result = service.urlRegex.exec(sourceUrl);
        let keys = {};
        service.keys.map(function(key, i) {
            keys[key] = result[i + 1];
        });
        let toPath = pathToRegexp.compile(targetUrl);
        let buildUrl = toPath(keys);
        logger.debug('Final url ' + buildUrl);
        return buildUrl;
    }


    static * obtainFiltersAndDataProviders(url, filter) {
        logger.debug('Obtaining data providers and filters ', filter);
        var resultExec = filter.urlRegex.exec(url);
        let keys = {};
        filter.keys.map(function(key, i) {
            keys[key] = resultExec[i + 1];
        });

        let toPath = pathToRegexp.compile(config.get('providers.' + filter.dataProvider));
        let keysUrlDataset = {};
        if (filter.paramProvider) {
            keysUrlDataset[filter.paramProvider] = keys[filter.paramProvider];
        }
        let urlDataset = toPath(keys);
        let requests = yield DispatcherService.getRequests(urlDataset, 'GET');
        logger.debug('request obtained ', requests);
        requests = requests.map(function(requestConfig, i) {
            return restCo(requestConfig);
        });

        try {
            let result = yield requests;
            if (result[0].response.statusCode === 200) {
                logger.debug('Response 200');
                let data = result[0].body;
                let filters = {};
                for (let i = 0, length = filter.filters.length; i < length; i++) {
                    filters[filter.filters[i]] = data[filter.filters[i]];
                }
                let response = {
                    filters: filters
                };
                response[filter.dataProvider] = data;
                return response;
            }
            throw new ServiceNotFound('Not found services to url:' + url);

        } catch (e) {
            if (e.status === 404) {
                throw new ServiceNotFound('Not found services to url:' + url);
            } else {
                logger.error('Error to request', e);
                throw e;
            }
        }
    }

    static * getRequests(sourceUrl, sourceMethod, body, headers, queryParams, files, userAuth) {
        logger.debug('Obtaining config request to url %s and queryParams %s', sourceUrl, queryParams);
        var parsedUrl = url.parse(sourceUrl);
        logger.debug('Checking if exist in filters the url %s', sourceUrl);
        let filter = yield Filter.findOne({
            $where: 'this.urlRegex && this.urlRegex.test(\'' + parsedUrl.pathname + '\')',
            method: sourceMethod
        });

        logger.debug('Filter Obtained', filter);
        let dataFilters = null;
        if (filter) {
            try {
                dataFilters = yield DispatcherService.obtainFiltersAndDataProviders(sourceUrl, filter);
            } catch (e) {
                logger.error('Error in obtainFiltersAndDataProviders');
                if (e instanceof ServiceNotFound) {
                    logger.debug('Service not found');
                    throw e;
                } else {
                    throw e;
                }
            }
            logger.debug('dataFilters', dataFilters);
        }
        var requests = [];

        let findFilters = {
            $where: 'this.urlRegex && this.urlRegex.test(\'' + parsedUrl.pathname + '\')',
            method: sourceMethod
        };

        if (dataFilters && dataFilters.filters) {
            findFilters.filters = dataFilters.filters;
        }

        var service = yield Service.findOne(findFilters);
        logger.debug('Service obtained: ', service);
        let configRequest = null;
        if(service){
            logger.info('Checking if the request is authenticated');
            if(service.authenticated && !userAuth){
                throw new NotAuthorized(sourceUrl + ': login required');
            }
        }

        if (service && service.endpoints) {
            for (let i = 0, length = service.endpoints.length; i < length; i++) {
                let endpoint = service.endpoints[i];
                logger.info('Dispathing request from %s to %s%s private endpoint. Type: %s', parsedUrl.pathname, endpoint.baseUrl, endpoint.path, endpoint.type);

                let url = yield DispatcherService.buildUrl(parsedUrl.pathname, endpoint.path, service);
                configRequest = {
                    uri: endpoint.baseUrl + url,
                    method: endpoint.method
                };

                if (queryParams) {
                    configRequest.uri = configRequest.uri + queryParams;
                }

                logger.debug('Create request to %s', configRequest.uri);
                if (endpoint.method === 'POST' || endpoint.method === 'PATCH' || endpoint.method === 'PUT') {
                    logger.debug('Method is %s. Adding body', configRequest.method);
                    configRequest.data = body;
                }

                if (files) {
                    logger.debug('Adding files');
                    let formData = {};
                    for (let key in files) {
                        formData[key] = rest.file(files[key].path);
                    }
                    configRequest.data = Object.assign(configRequest.data || {}, formData);
                    configRequest.multipart = true;
                }

                if (headers) {
                  config.headers = headers;
                }

                if (endpoint.data ) {
                    logger.debug('Obtaining data to endpoints');
                    for (let k = 0, lengthData = endpoint.data.length; k < lengthData; k++) {

                        if(endpoint.data[k] === 'loggedUser'){
                            configRequest.data[endpoint.data[k]] = userAuth;
                            if(!userAuth){
                                logger.warn('User not logged. Add undefined in userLogged body parameter');
                            }
                        } else {
                            if (!dataFilters || !dataFilters[endpoint.data[k]]) {
                                //TODO obtain data
                            }
                            if(dataFilters){
                                configRequest.data[endpoint.data[k]] = dataFilters[endpoint.data[k]];
                            }
                        }
                    }
                    logger.debug('Final request', configRequest);
                }

                //if is authenticated add user in the body
                var methodsWithBody = ['POST', 'PATCH', 'PUT'];
                logger.info('user auth', userAuth);
                if (userAuth !== undefined) {
                  if (methodsWithBody.indexOf(endpoint.method) > -1) {
                      logger.debug('Adding user in the body because url is authenticated');
                      configRequest.data.loggedUser = userAuth;
                  } else {
                      logger.debug('Adding user in the query string because url is authenticated');
                      configRequest.query = configRequest.query || {};
                      configRequest.query.loggedUser = userAuth;
                  }
                }

                requests.push(configRequest);
            }
            return requests;
        } else  {
            logger.error('Endpoint not found');
            throw new ServiceNotFound('Not found services to url:' + sourceUrl);
        }
    }
}

module.exports = DispatcherService;
