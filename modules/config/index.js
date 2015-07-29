var path = require('path');
var fs = require('fs');
var secret = require('./secret');
var env = process.env;

// NODE_ENV = development || test || production
env.NODE_ENV = env.NODE_ENV || 'development';

Error.stackTraceLimit = 20;

module.exports = {
    server: {
        port: env.PORT || 3000,
        host: env.HOST || '0.0.0.0',
        siteHost: env.SITE_HOST || '',
        staticHost: env.STATIC_HOST || ''
    },

    mongoose: require('./mongoose'),

    appKeys: [secret.sessionKey],
    auth: {
        session: {
            key: 'sid',
            prefix: 'sess:',
            cookie: {
                httpOnly: true,
                path: '/',
                overwrite: true,
                signed: true,
                maxAge: 3600 * 4 * 1e3 // session expires in 4 hours, remember me lives longer
            },
            // touch session.updatedAt in DB & reset cookie on every visit to prolong the session
            // koa-session-mongoose resaves the session as a whole, not just a single field
            rolling: true
        }
    },
    // api handlers from outside of the main repo
    apiHandlers: path.join(process.cwd(), 'api/handlers')
};