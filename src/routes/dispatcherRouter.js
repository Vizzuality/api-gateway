'use strict';

var Router = require('koa-router');
var logger = require('logger');
var request = require('co-request');
var url = require('url');
var Service = require('models/service');
var pathToRegexp = require('path-to-regexp');

var router = new Router({});


class DispatcherRouter {

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

    static * dispatch() {
        logger.info('Dispatch url', this.request.url, ' and method ', this.request.method);
        var parsedUrl = url.parse(this.request.url);
        var service = yield Service.findOne({
            $where: 'this.urlRegex && this.urlRegex.test(\'' + parsedUrl.pathname + '\')',
            method: this.request.method
        });

        if(service && service.endpoints) {
            let requests = [];
            let origRequest = this.request;

            for(let i = 0, length = service.endpoints.length; i < length; i++){
                let endpoint = service.endpoints[i];
                logger.info('Dispathing request from %s to %s%s private endpoint. Type: %s', parsedUrl.pathname, endpoint.baseUrl, endpoint.path, endpoint.type);

                let url = yield DispatcherRouter.buildUrl(parsedUrl.pathname, endpoint.path, service);
                let configRequest = {
                    uri: endpoint.baseUrl + url,
                    method: endpoint.method,
                    json: true
                };
                if(endpoint.method === 'POST' || endpoint.method === 'PATCH' || endpoint.method === 'PUT'){
                    configRequest.body = origRequest.body;
                }
                requests.push(request(configRequest));
            }
            //TODO: add support several responses
            try {
                var result = yield requests;

                this.body = result[0].body;
                this.response.type = result[0].headers['content-type'];
            } catch(e) {
                logger.error(e);
                this.throw(500, 'Unexpected error');
            }

        } else  {
            this.throw(404, 'Endpoint not found');
        }
    }

}

router.get('/*', DispatcherRouter.dispatch);
router.post('/*', DispatcherRouter.dispatch);
router.delete('/*', DispatcherRouter.dispatch);
router.put('/*', DispatcherRouter.dispatch);
router.patch('/*', DispatcherRouter.dispatch);

module.exports = router;
