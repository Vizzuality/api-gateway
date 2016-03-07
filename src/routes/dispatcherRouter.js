'use strict';

var Router = require('koa-router');
var logger = require('logger');
var request = require('co-request');
var url = require('url');
var Service = require('models/service');


var router = new Router({});


class DispatcherRouter {

    static * dispatch() {
        logger.info('Dispatch url', this.request.url, ' and method ', this.request.method);
        var parsedUrl = url.parse(this.request.url);
        logger.info({
            url: parsedUrl.pathname,
            method: this.request.method
        });
        var service = yield Service.findOne({
            url: parsedUrl.pathname,
            method: this.request.method
        });
        if(service && service.endpoints) {
            let requests = [];

            service.endpoints.forEach(function (endpoint) {
                logger.debug('Dispathing request from %s to %s private endpoint. Type: %s', parsedUrl.pathname, endpoint.url, endpoint.type);
                //TODO add suport POST, PATCH, DELETE,
                requests.push(request({
                    uri: endpoint.url,
                    method: endpoint.method
                }));
            });
            //TODO: add support several responses
            try{
                var result = yield requests;
                logger.debug(result[0]);
                this.body = JSON.parse(result[0].body);
                this.response.type= result[0].headers['content-type'];
            } catch(e){
                logger.error(e);
                this.throw(500, 'Unexpected error');
            }

        } else {
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
