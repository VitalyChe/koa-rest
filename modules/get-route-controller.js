var path = require('path');

function getStack() {
    var orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function (_, stack) {
        return stack;
    };

    var err = new Error;
    Error.captureStackTrace(err, arguments.callee);

    var stack = err.stack;
    Error.prepareStackTrace = orig;
    return stack;
}

module.exports = function (name) {
    var stack = getStack()
        , requester = stack[1].getFileName()
        , controller = path.dirname(requester, 'controller' + name)
        ;
    return require(controller);
};