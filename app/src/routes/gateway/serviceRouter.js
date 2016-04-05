'use strict';
var pathToRegexp = require('path-to-regexp');
var Router = require('koa-router');
var logger = require('logger');
var ServiceService = require('services/serviceService');
var Service = require('models/service');
var Filter = require('models/filter');
var Microservice = require('models/microservice');
var ServiceValidator = require('validators/serviceValidator');
var router = new Router({
    prefix: '/service'
});


class RegisterRouter {

    static * getServices() {
        logger.debug('Getting register services');
        this.body = yield Service.find({}, {
            '__v': 0,
            '_id': 0,
            'endpoints._id': 0
        }).exec();
    }
    static * register() {
        logger.info('Registering service', this.request.body);
        let services = yield ServiceService.registerMicroservices(this.request.body);

        this.body = services;

    }
    static * unregister() {
        logger.info('Unregistering service ', this.params.id);
        var service = yield Service.findOne({
            id: this.params.id
        });
        let response = {
            ok: 0
        };
        if(service){
            response = yield Service.remove();
            let countFilter = yield Filter.count({url:service.url});
            if(countFilter === 1){
                yield Filter.find({url: service.url}).remove();
            }
            yield Microservice.remove({id: this.params.id});
        } else{
            logger.error('Service not found');
            this.throw(404, 'GeoStore not found');
            return;
        }

        this.body = response;
    }

    static * unregisterAll() {
        logger.info('Unregistering all services');
        var remove = yield Service.remove({}).exec();
        yield Filter.remove({}).exec();
        yield Microservice.remove({id: {$ne: 'api-gateway'}});
        logger.debug(remove);
        this.body = remove;
    }

}

router.get('/', RegisterRouter.getServices);
router.post('/', ServiceValidator.register, RegisterRouter.register);
router.delete('/all', RegisterRouter.unregisterAll);
router.delete('/:id', RegisterRouter.unregister);


module.exports = router;
