'use strict';
var config = require('config');
var logger = require('logger');
const promise = require('bluebird');
const JWT = promise.promisifyAll(require('jsonwebtoken'));
var Microservice = require('models/microservice');
var jwt = require('koa-jwt');
module.exports = function(app) {

    app.use(function*(next) {
        if (this.headers && this.request.headers.authentication) {
            logger.debug('Authenticated microservice with token: ', this.request.headers.authentication);

            const service = yield JWT.verify(this.request.headers.authentication, config.get('server.jwtSecret'));
            if (service) {
                this.req.microservice = {
                    id: service.name || service.id
                };
            }

        }

        yield next;
    });
    app.use(jwt({
        secret: config.get('server.jwtSecret'),
        passthrough: true,
    }));

};
