'use strict';
var pathToRegexp = require('path-to-regexp');
var Router = require('koa-router');
var logger = require('logger');
var ServiceService = require('services/serviceService');
var Service = require('models/service');
var Filter = require('models/filter');
var Microservice = require('models/microservice');
var ServiceValidator = require('validators/serviceValidator');
var restCo = require('lib/restCo');
var crypto = require('crypto');
var config = require('config');
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

    static * unregister() {
        logger.info('Unregistering service ', this.params.id);
        var service = yield Service.findOne({
            id: this.params.id
        });
        let response = {
            ok: 0
        };
        if(service){
            response = yield service.remove();
            let countFilter = yield Service.count({url:service.url});
            if(countFilter === 0){
                yield Filter.remove({url: service.url});
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
        let remove = yield ServiceService.unregisterAll();

        this.body = remove;
    }



}

router.get('/', RegisterRouter.getServices);
router.delete('/all', RegisterRouter.unregisterAll);
router.delete('/:id', RegisterRouter.unregister);


module.exports = router;
