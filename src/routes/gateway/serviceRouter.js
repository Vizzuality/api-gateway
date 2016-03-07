'use strict';

var Router = require('koa-router');
var logger = require('logger');
var Service = require('models/service');
var ServiceValidator = require('validators/serviceValidator');
var router = new Router({
    prefix: '/service'
});


class RegisterRouter {

  static * getServices(){
    logger.debug('Getting register');
    this.body = yield Service.find({}, {'__v': 0, 'endpoints._id': 0}).exec();
  }

  static * register(){
      logger.info('Registering service', this.request.body);
      var service = yield new Service(this.request.body).save();
      this.body = service;
  }
  static * unregister(){
      logger.info('Unregistering service ', this.params.id);
      var remove = yield Service.findById(this.params.id).remove().exec();
      this.body = remove.ok;
  }

  static * unregisterAll(){
      logger.info('Unregistering all services ');
      var remove = yield Service.remove({}).exec();
      logger.debug(remove);
      this.body = remove;
  }

}

router.get('/', RegisterRouter.getServices);
router.post('/', ServiceValidator.register, RegisterRouter.register);
router.delete('/all', RegisterRouter.unregisterAll);
router.delete('/:id', RegisterRouter.unregister);


module.exports = router;
