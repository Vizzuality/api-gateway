'use strict';
var passport = require('koa-passport');
var config = require('config');
var co = require('co');
var logger = require('logger');
var auth = require('auth');
var UserService = require('services/userService');
var JSONAPIDeserializer = require('jsonapi-serializer').Deserializer;

var deserializer = function(obj){
    return function(callback){
        new JSONAPIDeserializer({keyForAttribute: 'camelCase'}).deserialize(obj, callback);
    };
};
module.exports = function() {

    var registerUser = function(accessToken, refreshToken, profile, done) {
        co(function*() {
            let user = yield UserService.createOrGetUser({
                provider: profile.provider,
                providerId: profile.id
            });
            user = yield deserializer(user);
            done(null, user);
        });
    };

    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        co(function*() {
            // var user = yield UserService.getUserById(id);
            done(null, user);
        });

    });
    if(auth.facebook.clientID && auth.facebook.clientSecret){
        logger.info('Facebook OAuth enable');
        var FacebookStrategy = require('passport-facebook').Strategy;
        passport.use(new FacebookStrategy({
                clientID: auth.facebook.clientID,
                clientSecret: auth.facebook.clientSecret,
                callbackURL: config.get('server.publicUrl') + '/auth/facebook/callback'
            },
            registerUser
        ));
    }

    if(auth.twitter.consumerKey && auth.twitter.consumerSecret){
        logger.info('Twitter OAuth enable');
        var TwitterStrategy = require('passport-twitter').Strategy;
        passport.use(new TwitterStrategy({
                consumerKey: auth.twitter.consumerKey,
                consumerSecret: auth.twitter.consumerSecret,
                callbackURL: config.get('server.publicUrl') + '/auth/twitter/callback'
            },
            registerUser
        ));
    }

    if(auth.google.clientID && auth.google.clientSecret){
        logger.info('Google OAuth enable');
        var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
        passport.use(new GoogleStrategy({
                clientID: auth.google.clientID,
                clientSecret: auth.google.clientSecret,
                callbackURL: config.get('server.publicUrl') + '/auth/google/callback'
            },
            registerUser
        ));
    }
};
