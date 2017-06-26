var gulp = require('gulp'),
    server = require('gulp-develop-server')
jshint = require('gulp-jshint');
const stylish = require('jshint-stylish');

gulp.task('lint', function () {
    return gulp.src(['./*.js', './controllers/**/*.js', './helpers/**/*.js', './middlewares/**/*.js', './models/**/*.js', './utility/**/*.js', './operations/**/*.js'])
        .pipe(jshint({'esversion': 6, 'laxcomma': 'false', 'node': true, asi: true}))
        .pipe(jshint.reporter(stylish));
});

// run server
gulp.task('server:start', function () {
    server.listen({path: './server.js'});
});

// restart server if app.js changed 
gulp.task('server:restart', function () {
    gulp.watch(['./*.js', './controllers/**/*.js', './helpers/**/*.js', './middlewares/**/*.js', './models/**/*.js', './utility/**/*.js', './operations/**/*.js'], server.restart);
});

gulp.task('default', ['lint', 'server:start', 'server:restart']);