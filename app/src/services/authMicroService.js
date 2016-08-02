'use strict';
var config = require('config');
var logger = require('logger');
var Microservice = require('models/microservice');
var jwt = require('koa-jwt');
module.exports = function(app) {

    app.use(function*(next) {
        if (this.headers && this.request.headers.authentication) {
            logger.debug('Authenticated microservice with token: ', this.request.headers.authentication);
            let service = yield Microservice.findOne({
                token: this.headers.authentication
            }, {
                swagger: 0
            });
            if (service) {
                this.req.microservice = service;
            }
        }

        yield next;
    });
    app.use(jwt({
        secret: config.get('server.jwtSecret'),
        passthrough: true,
    }));

};
