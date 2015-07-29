// adapted koa-logger for bunyan
const clsNamespace = require("continuation-local-storage").getNamespace("app");

// binds onfinish to current context
// bindEmitter didn't work here
exports.init = function (app) {

    app.use(function *logger(next) {
        var req = this.req;
        var start = Date.now();

        this.log.info({
                event: "request-start",
                method: req.method,
                url: req.url,
                referer: this.request.get('referer'),
                ua: this.request.get('user-agent')
            },
            "--> %s %s",
            req.method,
            req.originalUrl || req.url
        );

        // log when the response is finished or closed,
        // whichever happens first.
        var ctx = this;
        var res = this.res;

        function log(ctx, start, err, event) {
            // get the status code of the response
            var status = err ? (err.status || 500) : (ctx.status || 404);

            // set the color of the status code;
            var s = status / 100 | 0;

            // not ctx.url, but ctx.originalUrl because mount middleware changes it
            // request to /payments/common/order in case of error is logged as /order

            ctx.log[err ? 'error' : 'info']({
                event: "request-end",
                method: ctx.method,
                url: ctx.originalUrl,
                status: status,
                timeDuration: Date.now() - start
            }, "<-- %s %s", ctx.method, ctx.originalUrl);
        }

        function done(event) {
            res.removeListener('finish', onfinish);
            res.removeListener('close', onclose);
            log(ctx, start, null, event);
        }

        var onfinish = done.bind(null, 'finish');
        var onclose = done.bind(null, 'close');

        res.once('finish', clsNamespace.bind(onfinish));
        res.once('close', clsNamespace.bind(onclose));

        try {
            yield next;

        } catch (err) {
            // log uncaught downstream errors
            log(this, start, err);
            throw err;
        }
    });
};
