'use strict';
var mount = require('koa-mount');
var Router = require('koa-router');
var config = require('config');
var ApiRouter = new Router();
var passport = require('koa-passport');



var API = (function() {
    var twitter = passport.authenticate('twitter');

    var twitterCallback = passport.authenticate('twitter', {
        successRedirect: '/auth/success',
        failureRedirect: '/auth/fail'
    });

    var google = passport.authenticate('google', {
        scope: config.get('auth.google.scope')
    });

    var googleCallback = passport.authenticate('google', {
        successRedirect: '/auth/success',
        failureRedirect: '/auth/fail'
    });

    var facebook = passport.authenticate('facebook', {
        scope: config.get('auth.facebook.scope')
    });

    var facebookCallback = passport.authenticate('facebook', {
        successRedirect: '/auth/success',
        failureRedirect: '/auth/fail'
    });

    var failAuth = function*() {
        this.body = yield this.render('after-auth', {
            state: 'fail',
            user: null
        });
        this.codeStatus = 200;
    };

    var checkLogged = function*() {

        if (this.req.user) {
            this.body = this.req.user;
        } else {
            this.res.statusCode = 401;
        }
    };

    var success = function *(){
        this.body = this.req.user;
    };

    return {
        twitter: twitter,
        twitterCallback: twitterCallback,
        google: google,
        googleCallback: googleCallback,
        facebook: facebook,
        facebookCallback: facebookCallback,
        failAuth: failAuth,
        checkLogged: checkLogged,
        success: success
    };
}());

ApiRouter.get('/twitter', API.twitter);

ApiRouter.get('/twitter/callback', API.twitterCallback);

ApiRouter.get('/facebook', API.facebook);

ApiRouter.get('/facebook/callback', API.facebookCallback);

ApiRouter.get('/google', API.google);

ApiRouter.get('/google/callback', API.googleCallback);

ApiRouter.get('/fail', API.failAuth);

ApiRouter.get('/checkLogged', API.checkLogged);

ApiRouter.get('/success', API.success);

module.exports = ApiRouter;
