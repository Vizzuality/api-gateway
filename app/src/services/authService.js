'use strict';
var passport = require('koa-passport');
var config = require('config');
var co = require('co');
var logger = require('logger');
var auth = require('auth');
var UserService = require('services/userService');
module.exports = function() {

    var registerUser = function(accessToken, refreshToken, profile, done) {
        co(function*() {
            let user = yield UserService.createOrGetUser({
                provider: profile.provider,
                providerId: profile.id
            });
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

    var FacebookStrategy = require('passport-facebook').Strategy;
    passport.use(new FacebookStrategy({
            clientID: auth.facebook.clientID,
            clientSecret: auth.facebook.clientSecret,
            callbackURL: config.get('server.publicUrl') + '/auth/facebook/callback'
        },
        registerUser
    ));

    var TwitterStrategy = require('passport-twitter').Strategy;
    passport.use(new TwitterStrategy({
            consumerKey: auth.twitter.consumerKey,
            consumerSecret: auth.twitter.consumerSecret,
            callbackURL: config.get('server.publicUrl') + '/auth/twitter/callback'
        },
        registerUser
    ));

    var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

    passport.use(new GoogleStrategy({
            clientID: auth.google.clientID,
            clientSecret: auth.google.clientSecret,
            callbackURL: config.get('server.publicUrl') + '/auth/google/callback'
        },
        registerUser
    ));
};
