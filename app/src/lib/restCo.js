'use strict';

var rest = require('restler');
var logger = require('logger');
/**
    Wrapper of restler to use with generators
**/

var wrapperOut = function(request, callback){
    request.on('success', function(data, response){
        callback(null, {body: data, response: response});
    });
    request.on('fail', function(data, response){
        callback(data);
    });
    request.on('error', function(err, response){
        callback(err);
    });
};

var get = function(url, options, json){
    return function(callback){
        if(json){
            wrapperOut(rest.json(url, options.data, options), callback);
        }else{
            wrapperOut(rest.get(url, options), callback);
        }
    };
};
var post = function(url, options, json){
    return function(callback){
        if(json){
            wrapperOut(rest.postJson(url, options.data, options), callback);
        }else{
            wrapperOut(rest.post(url, options), callback);
        }
    };
};
var put = function(url, options, json){
    return function(callback){
        if(json){
            wrapperOut(rest.putJson(url, options.data, options), callback);
        }else{
            wrapperOut(rest.put(url, options), callback);
        }
    };
};
var del = function(url, options){
    return function(callback){
        wrapperOut(rest.del(url, options), callback);
    };
};
var patch = function(url, options, json){
    return function(callback){
        if(json){
            wrapperOut(rest.patchJson(url, options.data, options), callback);
        }else{
            wrapperOut(rest.patch(url, options), callback);
        }
    };
};

module.exports =  function(config){
    var uri = config.uri;
    var method = config.method;
    delete config.uri;
    delete config.method;

    switch (method.toUpperCase()) {
        case 'DELETE':
            return del(uri, config, !config.multipart);
        case 'POST':
            return post(uri, config, !config.multipart);
        case 'PUT':
            return put(uri, config, !config.multipart);
        case 'PATCH':
            return patch(uri, config, !config.multipart);
        case 'GET':
            return get(uri, config, !config.multipart);
        default:
            logger.warn('Method not specified');
            return get(uri, config, !config.multipart);
    }
    return post(uri, config);

};
