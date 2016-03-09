'use strict';

var Router = require('koa-router');
var logger = require('logger');
var request = require('co-request');
var DispatcherService = require('services/dispatcherService');
var ServiceNotFound = require('errors/serviceNotFound');


var router = new Router({});


class DispatcherRouter {

    static * dispatch() {
        logger.info('Dispatch url', this.request.url, ' and method ', this.request.method);
        let requests = null;
        try {
            requests = yield DispatcherService.getRequests(this.request.url, this.request.method, this.request.body);
        } catch(e) {
            logger.error(e);
            if(e instanceof ServiceNotFound) {
                this.throw(404, 'Endpoint not found');
            } else {
                this.throw(500, 'Unexpected error');
            }
        }
        try {
            requests = requests.map(function (requestConfig, i) {
                return request(requestConfig);
            });
            let result = yield requests;
            this.status = result[0].statusCode;
            this.body = result[0].body;
            this.response.type = result[0].headers['content-type'];

        } catch(e) {
            logger.error(e);
            this.throw(500, 'Unexpected error');
        }
    }

}

router.get('/*', DispatcherRouter.dispatch);
router.post('/*', DispatcherRouter.dispatch);
router.delete('/*', DispatcherRouter.dispatch);
router.put('/*', DispatcherRouter.dispatch);
router.patch('/*', DispatcherRouter.dispatch);

module.exports = router;
