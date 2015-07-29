/**
 * This file must be required at least ONCE.
 * After it's done, one can use require('mongoose')
 *
 * In web-app: this is done at init phase
 * In tests: in mocha.opts
 * In gulpfile: in beginning
 */

var mongoose = require('mongoose');
var log = require('log')();
var autoIncrement = require('mongoose-auto-increment');
var config = require('config');
var _ = require('lodash');

if (process.env.NODE_ENV = 'development') {
    mongoose.set('debug', true);
    log.debug(config.mongoose.uri, config.mongoose.options);
}

mongoose.connect(config.mongoose.uri, config.mongoose.options);
autoIncrement.initialize(mongoose.connection);

// bind context now for thunkify without bind
_.bindAll(mongoose.connection);
_.bindAll(mongoose.connection.db);

// yield .persist() or .destroy() for generators instead of save/remove
mongoose.plugin(function (schema) {

    schema.methods.persist = function (body) {
        var model = this;

        return function (callback) {
            if (body) model.set(body);
            model.save(function (err, changed) {
                return callback(err, changed);
            });
        };
    };

    schema.methods.destroy = function () {
        var model = this;

        return function (callback) {
            model.remove(callback);
        };
    };

    schema.statics.destroy = function (query) {
        return function (callback) {
            this.remove(query, callback);
        }.bind(this);
    };
});

mongoose.waitConnect = function (callback) {
    if (mongoose.connection.readyState == 1) {
        setImmediate(callback);
    } else {
        // we wait either for an error
        // OR
        // for a successful connection
        //console.log("MONGOOSE", mongoose, "CONNECTION", mongoose.connection, "ON", mongoose.connection.on);
        mongoose.connection.on("connected", onConnected);
        mongoose.connection.on("error", onError);
    }

    function onConnected() {
        log.debug("Mongoose has just connected");
        cleanUp();
        callback();
    }

    function onError(err) {
        log.debug('Failed to connect to DB', err);
        cleanUp();
        callback(err);
    }

    function cleanUp() {
        mongoose.connection.removeListener("connected", onConnected);
        mongoose.connection.removeListener("error", onError);
    }
};

module.exports = mongoose;
