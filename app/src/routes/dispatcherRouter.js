'use strict';

var Router = require('koa-router');
var logger = require('logger');
var request = require('co-request');
var DispatcherService = require('services/dispatcherService');
var ServiceNotFound = require('errors/serviceNotFound');

var router = new Router({});
var restCo = require('lib/restCo');

class DispatcherRouter {

    static * dispatch() {
        logger.info('Dispatch url', this.request.url, ' and method ', this.request.method);
        let requests = null;
        try {
            requests = yield DispatcherService.getRequests(this.request.url, this.request.method, this.request.body, this.request.headers, this.request.body.files);
        } catch (e) {
            logger.error(e);
            if (e instanceof ServiceNotFound) {
                this.throw(404, 'Endpoint not found');
                return;
            } else {
                this.throw(500, 'Unexpected error');
                return;
            }
        }
        try {
            logger.debug('Send request');
            requests = requests.map(function(requestConfig, i) {
                return restCo(requestConfig);
            });
            let result = yield requests;

            this.status = result[0].response.statusCode;
            this.body = result[0].body;
            this.response.type = result[0].response.headers['content-type'];

        } catch (e) {
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
