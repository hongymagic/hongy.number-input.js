var gulp  = require('gulp');
var fn    = require('fn.js');
var p     = require('gulp-load-plugins')();

gulp.task('test', function () {
	var config = require('./test/karma.config.js')();
	return gulp.src(config.files)
		.pipe(p.karma(fn.merge(config, { singleRun: true, action: 'run' })))
		.on('error', function (err) {
			p.util.log(err);
		});
});

gulp.task('jshint', function () {
	return gulp.src(['src/**/*.js'])
		.pipe(p.jshint())
		.pipe(p.jshint.reporter('jshint-stylish'));
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
		.pipe(p.uglify())
		.pipe(p.rename('hongy.input.min.js'))
		.pipe(gulp.dest('./dist/'))
		.on('error', function () {});
});

gulp.task('watch:test', function () {
	p.watch({ glob: 'test/**/*.js' }, ['test']);
});

gulp.task('watch', function () {
	p.watch({ glob: 'src/**/*.js' }, ['jshint', 'script'])
});

gulp.task('default', ['jshint', 'script', 'test']);