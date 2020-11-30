const BS = require('browser-sync').create();
const gulp = require('gulp');
const babel = require('gulp-babel');
const sass = require('gulp-sass');
const prefix = require('gulp-autoprefixer');

function style () {

	return gulp.src('./src/scss/*.scss')
		.pipe(sass())
		.pipe(prefix())
		.pipe(gulp.dest('./dist/css/'))
		.pipe(BS.stream());

}

function script () {

	return gulp.src('./src/es/*.js')
		.pipe(babel())
		.pipe(gulp.dest('./dist/js/'))
		.pipe(BS.stream());

}

gulp.task('serve', function (){

	BS.init({ server: './dist' });

	gulp.watch('./src/scss/*.scss', style);
	gulp.watch('./src/es/*.js', script);
	gulp.watch('./dist/index.html').on('change', BS.reload);

});

gulp.task(style);
gulp.task(script);
