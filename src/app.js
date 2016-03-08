'use strict';
var config = require('config');
var logger = require('logger');
var mongoose = require('mongoose');
var mongoUri = process.env.MONGOLAB_URI || config.get('mongodb.uri');
var auth = require('koa-basic-auth');
var mount = require('koa-mount');
var koa = require('koa');
var app = koa();

var onDbReady = function (err) {
    if(err) {
        logger.error(err);
        throw new Error(err);
    }

    var app = koa();
    //if dev environment then load koa-logger
    if(process.env.NODE_ENV === 'dev') {
        app.use(require('koa-logger')());
    }

    if(process.env.BASIC_AUTH && process.env.BASIC_AUTH === 'on'){
        app.use(function* (next) {
            try {
                yield next;
            } catch(err) {
                if(401 === err.status) {
                    this.status = 401;
                    this.set('WWW-Authenticate', 'Basic');
                    this.body = 'Not authorized';
                } else {
                    throw err;
                }
            }
        });
        app.use(mount('/gateway', auth({
            name: process.env.BASIC_AUTH_USERNAME,
            pass: process.env.BASIC_AUTH_PASSWORD
        })));
    }

    //load endpoints and load validate only for /gateway
    app.use(mount('/gateway', require('koa-bodyparser')()));
    app.use(mount('/gateway', require('koa-validate')()));
    app.use(mount('/gateway', require('routes/gateway/serviceRouter').middleware()));
    app.use(require('routes/dispatcherRouter').middleware());

    var server = require('http').Server(app.callback());

    var port = process.env.PORT || config.get('server.port');

    server.listen(port);
    logger.debug('NUEVO LOG');
    logger.info('API Gateway started in port:' + port);
};

mongoose.connect(mongoUri, onDbReady);
