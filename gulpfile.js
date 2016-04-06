var gulp = require('gulp'),
    path = require('path');

var concat = require('gulp-concat'),
    less = require('gulp-less'),
    nodemon = require('gulp-nodemon'),
    LessPluginCleanCSS = require('less-plugin-clean-css'),
    cleancss = new LessPluginCleanCSS({ advanced: true }),
    LessPluginAutoPrefix = require('less-plugin-autoprefix'),
    autoprefix= new LessPluginAutoPrefix({ browsers: ["last 2 versions"] }),
    fs = require('fs'),
    shell = require('gulp-shell'),
    del = require('del'),
    ghPages = require('gulp-gh-pages');

// requirements for the build process:
const nunjucks = require('gulp-nunjucks');
const data = require('gulp-data');

//create the patterns file
gulp.task('patterns' ,function() {
  return gulp.src('./templates/patterns/**/*.pattern')
    .pipe(concat('patterns.html'))
    .pipe(gulp.dest('./templates/patterns/'))
});

//compile the site's css
gulp.task('less', function () {
  return gulp.src('./templates/patterns/**/*.less')
    .pipe(concat('roobottom-com.less'))
    .pipe(gulp.dest('./assets/css/.cache/'))
    .pipe(less({
      paths: [ path.join(__dirname, './templates/patterns/_shared') ],
      plugins: [autoprefix, cleancss]
    }))
    .pipe(gulp.dest('./assets/css/'))
});

//start nodemon, this will take over the 'watch' processes
gulp.task('go', function () {
  nodemon({
    script: 'src/app.js'
  , ext: 'js html md less pattern example'
  , ignore: ["templates/patterns/patterns.html","posts/posts.json","_site/"]
  , env: { 'NODE_ENV': 'development' }
  , watch: ["src", "templates"]
  , tasks: ['patterns','less']
  })
})

//start nodemon, this will only rebuild the js, rather than the slow concat less and patterns
gulp.task('go:js', function () {
  nodemon({
    script: 'src/app.js'
  , ext: 'js html md less pattern example'
  , ignore: ["templates/patterns/patterns.html","posts/posts.json","_site/"]
  , env: { 'NODE_ENV': 'development' }
  , watch: ["src", "templates"]
  })
})

gulp.task('default', ['patterns','less','go']);


//gulp build task
gulp.task('server', shell.task([
  'node ./src/app.js'
]))
gulp.task('clean', function() {
  return del([
    './_site/**/*'
  ])
})
gulp.task('scrape',shell.task([
  'node ./src/static.js'
]))

gulp.task('deploy', function() {
  return gulp.src('./_site/**/*')
    .pipe(ghPages());
});

gulp.task('build',['clean','scrape'])
