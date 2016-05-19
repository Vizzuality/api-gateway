'use strict';
var config = require('config');
var logger = require('logger');
var Microservice = require('models/microservice');
module.exports = function() {

    return function*(next) {
        if (this.headers && this.request.headers.authentication) {
            logger.debug('Authenticated microservice with token: ', this.request.headers.authentication);
            let service = yield Microservice.findOne({
                token: this.headers.authentication
            }, {swagger: 0});
            if (service) {
                this.req.microservice = service;
            }
        }
        yield next;
    };
};
