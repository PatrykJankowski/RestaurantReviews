
// Grab packages
const gulp = require('gulp'),
      htmlmin = require('gulp-html-minifier'),
      sass = require('gulp-sass'),
      uglify = require('gulp-uglify-es').default,
      image = require('gulp-image');


// Tasks
gulp.task('html', function() {
    gulp.src('src/*.html')
        .pipe(htmlmin({collapseWhitespace: true, minifyJS: true, minifyCSS: true, removeComments: true}))
        .pipe(gulp.dest('dist/'));
});

gulp.task('styles', function() {
    gulp.src('src/css/*.css')
        .pipe(sass().on('error', sass.logError))
        .pipe(sass({outputStyle: 'compressed'}))
        .pipe(gulp.dest('dist/css'));
});


gulp.task('js', function () {
    gulp.src('src/js/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'));

    gulp.src('src/sw.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist/'));
    gulp.src('src/manifest.json')
        .pipe(gulp.dest('dist/'));
});


gulp.task('images', function() {
    gulp.src("src/img/**").pipe(image()).pipe(gulp.dest("dist/img"));
});


// Watch tasks
gulp.task('watch',function() {
    gulp.watch('src/*.html',['html']);
    gulp.watch('src/js/*.js',['js']);
    gulp.watch('src/img/*',['images']);
});



// Run tasks
gulp.task('default', ['watch', 'html', 'styles', 'js', 'images']);
