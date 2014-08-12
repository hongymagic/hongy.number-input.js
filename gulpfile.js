var gulp  = require('gulp');
var fn    = require('fn.js');
var p     = require('gulp-load-plugins')();

gulp.task('test', function () {
	var config = require('./test/karma.config.js')();
	return gulp.src(config.files)
		.pipe(p.karma(fn.merge(config, { singleRun: true, action: 'run' })))
		.on('error', function (err) {
			p.util.log('error running tests', err);
		});
});

gulp.task('script', function () {
	return gulp.src([
			'src/input.prefix',
			'src/curry.js',
			'src/validations.js',
			'src/directive/input.js',
			'src/input.suffix'
		])
		.pipe(p.concat('hongy.input.js'))
		.pipe(gulp.dest('./dist/'))
		.pipe(p.jshint())
		.pipe(p.jshint.reporter('jshint-stylish'))
		.pipe(p.uglify())
		.pipe(p.rename('hongy.input.min.js'))
		.pipe(gulp.dest('./dist/'));
});

gulp.task('default', ['script']);