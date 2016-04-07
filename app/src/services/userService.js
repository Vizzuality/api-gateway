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
            let requests = yield DispatcherService.getRequests(CREATE_OR_GET, 'POST', data);
            logger.debug('Requests obtained', requests);
            if(requests){
                logger.debug('Send request');
                requests = requests.map(function(requestConfig) {
                    return restCo(requestConfig);
                });
                let result = yield requests;
                let status = result[0].response.statusCode;
                let user = result[0].body;
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
            let requests = yield DispatcherService.getRequests(GET_BY_ID + id, 'GET');
            logger.debug('Requests obtained', requests);
            if(requests){
                logger.debug('Send request');
                requests = requests.map(function(requestConfig) {
                    return restCo(requestConfig);
                });
                let result = yield requests;
                let status = result[0].response.statusCode;
                let user = result[0].body;
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
