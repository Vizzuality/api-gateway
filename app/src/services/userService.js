'use strict';

var logger = require('logger');
var DispatcherService = require('services/dispatcherService');
var ServiceNotFound = require('errors/serviceNotFound');
var restCo = require('lib/restCo');
const CREATE_OR_GET = '/user/createOrGet';
const GET_BY_ID = '/user/';

class UserService {

    static * createOrGetUser(data){
        try{
            logger.info('Create or getter user from management user microservice');
            let requestConfig = yield DispatcherService.getRequest(CREATE_OR_GET, 'POST', data, null, null, null, {id: 'api-gateway'});
            logger.debug('Requests obtained', requestConfig);
            if(requestConfig){
                logger.debug('Send request');
                var requests = restCo(requestConfig);

                let result = yield requests;
                let status = result.response.statusCode;
                let user = result.body;
                return user;
            } else {
                throw new ServiceNotFound('User service not found');
            }
        } catch(e){
            logger.error(e);
            throw e;
        }

    }

    static * getUserById(id){
        try{
            logger.info('Get user by id %s from management user microservice.', id);
            let requestConfig = yield DispatcherService.getRequest(GET_BY_ID + id, 'GET');
            logger.debug('Requests obtained', requestConfig);
            if(requestConfig){
                logger.debug('Send request');
                var requests = restCo(requestConfig);
                let result = yield requests;
                let status = result.response.statusCode;
                let user = result.body;
                return user;
            } else {
                throw new ServiceNotFound('User service not found');
            }
        } catch(e){
            logger.error(e);
            throw e;
        }
    }

}

module.exports = UserService;
