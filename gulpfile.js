var gulp = require('gulp'),
    path = require('path');

var concat = require('gulp-concat'),
    less = require('gulp-less'),
    LessPluginCleanCSS = require('less-plugin-clean-css'),
    cleancss = new LessPluginCleanCSS({ advanced: true }),
    LessPluginAutoPrefix = require('less-plugin-autoprefix'),
    autoprefix= new LessPluginAutoPrefix({ browsers: ["last 2 versions"] });

//create the patterns file
gulp.task('patterns' ,function() {
  return gulp.src('./templates/patterns/**/*.pattern')
    .pipe(concat('patterns.html'))
    .pipe(gulp.dest('./templates/patterns/'))
});

//compile the site's css
gulp.task('less', function () {
  return gulp.src('./templates/patterns/**/*.less')
    .pipe(less({
      paths: [ path.join(__dirname, './templates/patterns/_shared') ],
      plugins: [autoprefix, cleancss]
    }))
    .pipe(concat('roobottom-com.css'))
    .pipe(gulp.dest('./assets/css/'))
});

gulp.task('watch', function() {

  var watch_options = {
        interval: 1000, // default 100
        debounceDelay: 500, // default 500
        mode: 'poll'
  }

  gulp.watch('./templates/patterns/**/*.pattern',watch_options,['patterns'])
  gulp.watch('./templates/patterns/**/*.less',watch_options,['less'])
})

gulp.task('default', ['patterns','less','watch'])