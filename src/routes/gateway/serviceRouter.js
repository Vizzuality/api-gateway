'use strict';
var pathToRegexp = require('path-to-regexp');
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

  static * saveService(data){
      logger.debug('Saving service');
      let keys = [];
      let regex = pathToRegexp(data.url, keys);
      if(keys && keys.length > 0){
          keys = keys.map(function(key, i){
              return key.name;
          });
      }
      let service = yield new Service({
          id: data.id,
          name: data.name,
          url: data.url,
          urlRegex: regex,
          keys: keys,
          method: data.method,
          endpoints: data.endpoints,
      }).save();
      logger.debug('Saving correct ', service);
      return service;
  }

  static * createServices(data){
      logger.info('Saving services');
      let services = [];
      if(data && data.urls){
          for(let i= 0, length = data.urls.length; i < length; i++){
              services.push(yield RegisterRouter.saveService({
                  id: data.id,
                  name: data.name,
                  url: data.urls[i].url,
                  method: data.urls[i].method,
                  endpoints: data.urls[i].endpoints,
              }));
          }
      }
      logger.info('Save correct');
      return services;
  }

  static * register(){
      logger.info('Registering service', this.request.body);
      var exist = yield Service.find({id: this.request.body.id}).exec();
      var services = null;
      if(!exist || exist.length === 0){
          services = yield RegisterRouter.createServices(this.request.body);

          this.body = services;
      } else {
          logger.debug('Service exist. Remove olds...');
          yield Service.find({id: this.request.body.id}).remove().exec();
          logger.debug('Remove correct.');
          services = yield RegisterRouter.createServices(this.request.body);
          this.body = services;
      }
  }
  static * unregister(){
      logger.info('Unregistering service ', this.params.id);
      var remove = yield Service.find({id: this.params.id}).remove().exec();
      this.body = remove.ok;
  }

  static * unregisterAll(){
      logger.info('Unregistering all services');
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
