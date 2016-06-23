'use strict';

var _ = require('lodash');
var Router = require('koa-router');
var logger = require('logger');
var request = require('co-request');
var DispatcherService = require('services/dispatcherService');
var ServiceNotFound = require('errors/serviceNotFound');
var NotAuthorized = require('errors/notAuthorized');
var router = new Router({});
var restCo = require('lib/restCo');
var fs = require('fs');
var config = require('config');
var url = require('url');

var unlink = function(file) {
    return function(callback) {
        fs.unlink(file, callback);
    };
};

var ALLOWED_HEADERS = [
  'access-control-allow-origin',
  'access-control-allow-headers',
  'cache-control',
  'charset'
];

var corsHeadersForRequest = function(request) {
    if (request.headers.origin !== undefined) {
        var origin = request.headers.origin,
            domain = url.parse(origin).hostname;

        if (config.get('allowed_domains').indexOf(domain) > -1) {
            return {
                'Access-Control-Allow-Origin': origin,
                'Access-Control-Allow-Credentials': 'true'
            };
        }
    }

    return { 'Access-Control-Allow-Origin': '*' };
};

var getHeadersFromResponse = function(response) {
    var validHeaders = {};
    _.each(response.headers, function(value, key) {
        if (ALLOWED_HEADERS.indexOf(key.toLowerCase()) > -1) {
          validHeaders[key] = value;
        }
    });
    return validHeaders;
};

class DispatcherRouter {

    static * dispatch() {
        logger.info('Dispatch url', this.request.url, ' and method ', this.request.method);
        let requests = null;
        try {
            requests = yield DispatcherService.getRequests(this.request.path, this.request.method, this.request.body, this.request.headers, this.request.search, this.request.body.files, (this.req.user || this.req.microservice));
        } catch (e) {
            logger.error(e);
            if (e instanceof ServiceNotFound) {
                logger.debug('Service not found');
                this.throw(404, 'Endpoint not found');
                return;
            } if (e instanceof NotAuthorized) {
                logger.debug('Not authorized');
                this.throw(401, e.message);
                return;
            } else {
                this.throw(500, 'Unexpected error');
                return;
            }
        }
        try {
            logger.debug('Send request');
            requests = requests.map(function(requestConfig) {
                return restCo(requestConfig);
            });
            let result = yield requests;

            this.set(corsHeadersForRequest(this.request));
            this.set(getHeadersFromResponse(result[0].response));
            this.status = result[0].response.statusCode;
            this.body = result[0].body;
            this.response.type = result[0].response.headers['content-type'];
        } catch (e) {
            logger.error('Error to request', e);
            if(e.errors && e.errors.length > 0 && e.errors[0].status >= 400 && e.errors[0].status < 500){
                this.status = e.errors[0].status;
                this.body = e;
            } else {
                this.throw(500, 'Unexpected error');
            }

        } finally {
            if(this.request.body.files){
                logger.debug('Removing files');
                let files = Object.keys(this.request.body.files);
                for( let i=0, length= files.length; i < length; i++){
                    logger.debug('Removing file  %s', this.request.body.files[files[i]].path);
                    yield unlink(this.request.body.files[files[i]].path);
                }
            }
        }
    }

}

router.get('/*', DispatcherRouter.dispatch);
router.post('/*', DispatcherRouter.dispatch);
router.delete('/*', DispatcherRouter.dispatch);
router.put('/*', DispatcherRouter.dispatch);
router.patch('/*', DispatcherRouter.dispatch);

module.exports = router;
