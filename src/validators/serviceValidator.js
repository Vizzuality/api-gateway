'use strict';
var logger = require('logger');

class ServiceValidator {

    static * register(next) {
        logger.debug('Validate register service');
        this.checkBody('name').notEmpty();
        this.checkBody('url').notEmpty();
        this.checkBody('method').notEmpty();
        this.checkBody('endpoints').notEmpty();
        if(this.errors) {
            logger.debug('errors ', this.errors);
            this.body = this.errors;
            this.status = 400;
            return;
        }
        yield next;

    }

}

module.exports = ServiceValidator;
