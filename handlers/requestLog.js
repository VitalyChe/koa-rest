exports.init = function (app) {
    app.use(function*(next) {

        this.log = app.log.child({
            requestId: this.requestId
        });

        yield* next;
    });

};
