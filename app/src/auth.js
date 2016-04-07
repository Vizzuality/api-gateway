'use strict';

let auth = {};
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
        auth =  require(__dirname + '/../../../config/auth.json');
    }
}
module.exports = auth;
