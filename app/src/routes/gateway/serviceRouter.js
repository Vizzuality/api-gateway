'use strict';
var pathToRegexp = require('path-to-regexp');
var Router = require('koa-router');
var logger = require('logger');
var ServiceService = require('services/serviceService');
var Service = require('models/service');
var Filter = require('models/filter');
var ServiceValidator = require('validators/serviceValidator');
var router = new Router({
    prefix: '/service'
});


class RegisterRouter {

    static * getServices() {
        logger.debug('Getting register');
        this.body = yield Service.find({}, {
            '__v': 0,
            'endpoints._id': 0
        }).exec();
    }
    static * register() {
        logger.info('Registering service', this.request.body);
        var exist = yield Service.find({
            id: this.request.body.id
        }).exec();
        var services = null;
        if (exist && exist.length > 0) {
            logger.debug('Service exist. Remove olds...');
            yield Service.find({
                id: this.request.body.id
            }).remove().exec();
            logger.debug('Remove correct.');
        }
        services = yield ServiceService.createServices(this.request.body);

        this.body = services;

    }
    static * unregister() {
        logger.info('Unregistering service ', this.params.id);
        var service = yield Service.find({
            id: this.params.id
        }).exec();
        yield service.remove().exec();
        let countFilter = yield Filter.count({url:service.url}).exec();
        if(countFilter === 1){
            yield Filter.find({url: service.url}).remove().exec();
        }
        this.body = 'OK';
    }

    static * unregisterAll() {
        logger.info('Unregistering all services');
        var remove = yield Service.remove({}).exec();
        yield Filter.remove({}).exec();
        logger.debug(remove);
        this.body = remove;
    }

}

router.get('/', RegisterRouter.getServices);
router.post('/', ServiceValidator.register, RegisterRouter.register);
router.delete('/all', RegisterRouter.unregisterAll);
router.delete('/:id', RegisterRouter.unregister);


module.exports = router;
