'use strict';
if (process.env.NODE_ENV === 'prod'){
    require('newrelic');
}

var config = require('config');
var co = require('co');
var yaml = require('yaml-js');
var fs = require('fs');
var logger = require('logger');
var mongoose = require('mongoose');
var mongoUri = process.env.MONGOLAB_URI || 'mongodb://' + config.get('mongodb.host') + ':' + config.get('mongodb.port') + '/' + config.get('mongodb.database');
var auth = require('koa-basic-auth');
var mount = require('koa-mount');
var koa = require('koa');
var cors = require('kcors');
var path = require('path');
var passport = require('koa-passport');
var session = require('koa-generic-session');
var MongoStore = require('koa-generic-session-mongo');
var koaBody = require('koa-body')({
    multipart: true,
    jsonLimit: '50mb',
    formLimit: '50mb',
    textLimit: '50mb',
    formidable: {
        uploadDir: '/tmp',
        onFileBegin: function(name, file) {
            var folder = path.dirname(file.path);
            file.path = path.join(folder, file.name);
        }
    }
});
var url = require('url');

var ErrorSerializer = require('serializers/errorSerializer');
var RegisterService = require('services/registerService');

var onDbReady = function(err) {
    if (err) {
        logger.error(err);
        throw new Error(err);
    }



    var app = koa();

    app.use(cors({
      allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
      credentials: true,
      origin: function(request) {
        if (request.headers.origin) {
            var origin = request.headers.origin,
                domain = url.parse(origin).hostname;
            if (config.get('allowed_domains').indexOf(domain) > -1) {
                logger.debug('Allowed Domain');
                return origin;
            }
        }

        return '*';
      }
    }));

    //config sessions in mongo
    if(process.env.AUTH_ENABLED === 'true'){
        logger.info('OAUTH Enable');
        app.keys = [config.get('server.sessionKey')];
        app.use(session({
            store: new MongoStore({
                url: mongoUri
            }),
            cookie: {
                domain: config.get('server.cookie.domain')
            }
        }));
    }

    if (process.env.BASIC_AUTH && process.env.BASIC_AUTH === 'on') {
        app.use(function*(next) {
            try {
                yield next;
            } catch (err) {
                if (401 === err.status) {
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

    //catch errors and send in jsonapi standard. Always return vnd.api+json
    app.use(function*(next) {
        try {
            yield next;
        } catch (err) {
            this.status = err.status || 500;
            this.response.type = 'application/vnd.api+json';
            if (process.env.NODE_ENV === 'prod' && this.status === 500) {
                this.body = 'Unexpected error';
            }
            this.body = ErrorSerializer.serializeError(this.status, err.message);
        }

    });

    // passport configuration
    if(process.env.AUTH_ENABLED === 'true'){
        require('services/authService')();
        app.use(passport.initialize());
        app.use(passport.session());
    }

    // add filter to microservice authentication
    require('services/authMicroService')(app);

    //load endpoints and load validate only for /gateway
    app.use(koaBody);
    app.use(mount('/gateway', require('koa-validate')()));
    app.use(mount('/gateway', require('routes/gateway/serviceRouter').middleware()));
    app.use(mount('/doc', require('routes/docRouter').middleware()));

    if(process.env.AUTH_ENABLED === 'true'){
        app.use(mount('/auth', require('routes/auth/authRouter').middleware()));
    }

    app.use(require('routes/dispatcherRouter').middleware());

    // create server
    var server = require('http').Server(app.callback());

    var port = process.env.PORT || config.get('server.port');

    server.listen(port);

    co(function*() {
        logger.info('Add doc of the microservice');
        try {
            yield RegisterService.addDataMicroservice({
                id: 'api-gateway',
                swagger: yaml.load(fs.readFileSync(__dirname + '/../public-swagger.yml').toString())
            });
        } catch (e) {
            logger.error(e);
        }
    });

    logger.info('API Gateway started in port:' + port);
};

mongoose.connect(mongoUri, onDbReady);
