var gulp = require('gulp'),
    ts = require('gulp-typescript');

var tsproject = ts.createProject('./tsconfig.json');

gulp.task('scripts', function() {
  return gulp.src('./Main.ts')
    .pipe(tsproject())
    .pipe(gulp.dest('./'));
})

gulp.task('watch', function() {
  // livereload.listen()
  return gulp.watch('./**/*.ts', ['scripts'])
})

gulp.task('default', ['scripts', 'watch'])