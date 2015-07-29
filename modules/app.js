//require("time-require");

var fs = require('fs');
const config = require('config');
var json = require('koa-json');
var bodyParser = require('koa-bodyparser');

//require('cls'); // init CLS namespace once, handler used below

const Application = require('application');
const app = new Application();

if (process.env.NODE_ENV != 'development') {
    // only log.error in prod, otherwise just die
    process.on('uncaughtException', function (err) {
        // let bunyan handle the error
        app.log.error({
            message: err.message,
            name: err.name,
            errors: err.errors,
            stack: err.stack
        });
        process.exit(255);
    });
}

// The app is always behind Nginx which serves static
// trust all headers from the proxy
// X-Forwarded-Host
// X-Forwarded-Proto
// X-Forwarded-For -> ip
app.proxy = true;

// ========= Helper handlers ===========
app.use(json());
app.use(bodyParser());
app.requireHandler('cls');

app.use(function*(next) {
    this.countryCode = (this.get('cf-ipcountry') || this.get('x-nginx-geo') || '').toLowerCase();
    if (this.countryCode == 'xx') {
        this.countryCode = '';
    }
    yield* next;
});

//app.use(function *catchErrors(next) {
//    try {
//        yield next;
//    } catch (err) {
//        this.response.type = 'application/vnd.api+json';
//        this.status = err.status || 500;
//        this.body = {
//            error: err.message
//        }
//    }
//});

app.requireHandler('mongooseHandler');
app.requireHandler('requestId');
app.requireHandler('requestLog');
app.requireHandler('nocache');

//app.requireHandler('time');

// this logger only logs HTTP status and URL
// before everything to make sure it log all
app.requireHandler('accessLogger');
//app.requireHandler('url-shortener');

//app.requireHandler('session');

// ======== API Endpoint services ==========
if (fs.existsSync(config.apiHandlers)) {
    fs.readdirSync(config.apiHandlers)
        .forEach(function (extraHandler) {
            if (extraHandler[0] == '.') return;
            app.requireHandler(extraHandler);
        });
}

// must be last
app.requireHandler('404');

// uncomment for time-require to work
//process.emit('exit');

module.exports = app;


