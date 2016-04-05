'use strict';
var passport = require('koa-passport');
var config = require('config');
var co = require('co');
var logger = require('logger');
var User = require('models/user');
var DispatcherService = require('services/dispatcherService');
module.exports = function() {

    var registerUser = function(accessToken, refreshToken, profile, done) {
        co(function*() {
            //TODO: Do request to User microservice ==> POST /user/createOrGet
            done(null, {
                provider: profile.provider,
                providerId: profile.id
            });
            // try {
            //     var userExist = yield User.findOne({
            //         provider: profile.provider,
            //         providerId: profile.id
            //     });
            //     if (!userExist) {
            //         logger.debug(profile);
            //         var user = {
            //             fullName: profile.displayName,
            //             provider: profile.provider,
            //             providerId: profile.id,

            //             createdAt: new Date()
            //         };
            //         if (profile.emails) {
            //             user.email = profile.emails[0].value;
            //         }

            //         logger.debug('User to register', user);
            //         userExist = yield new User(user).save();

            //     } else {
            //         logger.debug('Yet exist user.');
            //     }

            //     done(null, userExist);
            // } catch (e) {
            //     logger.error(e);
            //     done(new Error('Error login user'), null);
            // }
        });
    };

    passport.serializeUser(function(user, done) {
        logger.debug('SERIALIZE USER\n\n\n\n');
        logger.debug(user);
        logger.debug('FIN SERIALIZE USER\n\n\n\n');
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        co(function*() {
            logger.debug('DESERIALIZE USER\n\n\n\n');
            logger.debug(id);
            logger.debug('FIN DESERIALIZE USER\n\n\n\n');

            var user = yield User.findById(id);

            done(null, user);
        });

    });


    var FacebookStrategy = require('passport-facebook').Strategy;
    passport.use(new FacebookStrategy({
            clientID: config.get('auth.facebook.clientID'),
            clientSecret: config.get('auth.facebook.clientSecret'),
            callbackURL: config.get('server.publicUrl') + '/auth/facebook/callback'
        },
        registerUser
    ));

    var TwitterStrategy = require('passport-twitter').Strategy;
    passport.use(new TwitterStrategy({
            consumerKey: config.get('auth.twitter.consumerKey'),
            consumerSecret: config.get('auth.twitter.consumerSecret'),
            callbackURL: config.get('server.publicUrl') + '/auth/twitter/callback'
        },
        registerUser
    ));

    var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

    passport.use(new GoogleStrategy({
            clientID: config.get('auth.google.clientID'),
            clientSecret: config.get('auth.google.clientSecret'),
            callbackURL: config.get('server.publicUrl') + '/auth/google/callback'
        },
        registerUser
    ));
};