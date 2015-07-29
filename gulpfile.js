/**
 * NB: All tasks are initialized lazily, even plugins are required lazily,
 * running 1 task does not require all tasks' files
 */

const gulp = require('gulp');
const linkModules = require('./modules/linkModules');

process.on('uncaughtException', function (err) {
    console.error(err.message, err.stack, err.errors);
    process.exit(255);
});

function lazyRequireTask(path) {
    var args = [].slice.call(arguments, 1);
    return function (callback) {
        var task = require(path).apply(this, args);

        return task(callback);
    };
}

linkModules({
    src: [
        'modules/*',
        'handlers/*',
        'api/handlers/*',
        'api/modules/*'
    ]
});

/* the task does nothing, used to run linkModules only */
gulp.task('init');

gulp.task("nodemon", lazyRequireTask('./tasks/nodemon', {
    ext: "js",
    nodeArgs: ['--debug', '--harmony_classes'],
    //nodeArgs: ['--debug', '--harmony-generators'],
    script: "./bin/server",
    watch: ["handlers", "modules", 'api/handlers', 'api/modules'],
    env: {'NODE_ENV': 'development'}
}));

gulp.task('dev', ['nodemon']);