'use strict';
var mount = require('koa-mount');
var Router = require('koa-router');
var config = require('config');
var ApiRouter = new Router();
var passport = require('koa-passport');
var auth = require('auth');
var logger = require('logger');


var API = (function() {
    var twitter = passport.authenticate('twitter');

    var twitterCallback = passport.authenticate('twitter', {
        successRedirect: '/auth/success',
        failureRedirect: '/auth/fail'
    });

    var google = passport.authenticate('google', {
        scope: auth.google.scope
    });

    var googleCallback = passport.authenticate('google', {
        successRedirect: '/auth/success',
        failureRedirect: '/auth/fail'
    });

    var facebook = passport.authenticate('facebook', {
        scope: auth.facebook.scope
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
        logger.debug('Success', this.session.redirectUrl);
        if(this.session.redirectUrl){
            logger.debug(this.session.redirectUrl);
            this.redirect(this.session.redirectUrl);
            return;
        }
        this.body = this.req.user;
    };

    var logout = function *(){
        this.logout();
        this.body = 'ok';
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
        success: success,
        logout: logout
    };
}());

var setRedirectUrl = function *(next){
    logger.debug('REFERRER ', this.headers.referer);
    this.session.redirectUrl = this.headers.referer;
    yield next;
};

ApiRouter.get('/twitter', setRedirectUrl, API.twitter);

ApiRouter.get('/twitter/callback', API.twitterCallback);

ApiRouter.get('/facebook', setRedirectUrl, API.facebook);

ApiRouter.get('/facebook/callback', API.facebookCallback);

ApiRouter.get('/google', setRedirectUrl, API.google);

ApiRouter.get('/google/callback', API.googleCallback);

ApiRouter.get('/fail', API.failAuth);

ApiRouter.get('/checkLogged', API.checkLogged);

ApiRouter.get('/success', API.success);

ApiRouter.get('/logout', API.logout);

module.exports = ApiRouter;
