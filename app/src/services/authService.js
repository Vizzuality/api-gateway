'use strict';
var passport = require('koa-passport');
var config = require('config');
var co = require('co');
var logger = require('logger');
var UserService = require('services/userService');
module.exports = function() {

    var auth = {};
    if (process.env.AUTH_ENABLED === 'true') {
        if (process.env.GOOGLE_CLIENTID || process.env.FB_CLIENTID || process.env.TW_CONSUMERKEY) {
            auth = {
                google: {
                    clientID: process.env.GOOGLE_CLIENTID,
                    clientSecret: process.env.GOOGLE_CLIENTSECRET,
                    scope: process.env.GOOGLE_SCOPE
                },
                facebook: {
                    clientID: process.env.FB_CLIENTID,
                    clientSecret: process.env.FB_CLIENTSECRET,
                    scope: process.env.FB_SCOPE
                },
                twitter: {
                    consumerKey: process.env.TW_CONSUMERKEY,
                    consumerSecret: process.env.TW_CONSUMERSECRET
                }
            };
        } else {
            auth = require(__dirname + '/../../../config/auth.json');
        }
    }

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
