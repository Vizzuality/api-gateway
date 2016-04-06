'use strict';

var logger = require('logger');
var DispatcherService = require('services/dispatcherService');
var restCo = require('lib/restCo');
const CREATE_OR_GET = '/user/createOrGet';
const GET_BY_ID = '/user/';

class UserService {

    static * createOrGetUser(data){
        try{
            logger.info('Create or getter user from management user microservice');
            let requests = DispatcherService.getRequests(CREATE_OR_GET, 'POST');
            logger.debug('Send request');
            requests = requests.map(function(requestConfig) {
                return restCo(requestConfig);
            });
            let result = yield requests;
            let status = result[0].response.statusCode;
            let user = result[0].body;
            return user;
        } catch(e){
            logger.error(e);
            throw e;
        }
        
    }
    
    static * getUserById(id){
        try{
            logger.info('Get user by id from management user microservice');
            let requests = DispatcherService.getRequests(GET_BY_ID + id, 'GET');
            logger.debug('Send request');
            requests = requests.map(function(requestConfig) {
                return restCo(requestConfig);
            });
            let result = yield requests;
            let status = result[0].response.statusCode;
            let user = result[0].body;
            return user;
        } catch(e){
            logger.error(e);
            throw e;
        }
    }
   
}

module.exports = UserService;
