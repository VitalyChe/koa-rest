var mountHandlerMiddleware = require('lib/mountHandlerMiddleware');

exports.init = function (app) {
    app.use(mountHandlerMiddleware('/url', __dirname));
};
