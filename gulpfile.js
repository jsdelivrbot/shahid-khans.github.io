
var gulp        = require('gulp');
var gulpIf      = require('gulp-if');
var cleanCSS    = require('gulp-clean-css');
var browserSync = require('browser-sync');
var sass        = require('gulp-sass');
var prefix      = require('gulp-autoprefixer');
var cssnano     = require('gulp-cssnano');
var concat      = require('gulp-concat');
var uglify      = require('gulp-uglify');
var cp          = require('child_process');

var messages = {
    jekyllDev: '<span style="color: grey">Running:</span> $ jekyll build for dev',
    jekyllProd: '<span style="color: grey">Running:</span> $ jekyll build for prod'
};

/**
 * Build the Jekyll Site in development mode
 */
gulp.task('jekyll-dev', function (done) {
  browserSync.notify(messages.jekyllDev);
  return cp.spawn('jekyll', ['build',  '--future', '--config', '_config.yml,_config_dev.yml'], {stdio: 'inherit'})
    .on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-dev'], function () {
  browserSync.reload();
});

/**
 * Wait for jekyll-dev, then launch the Server
 */
gulp.task('browser-sync', ['sass', 'jekyll-dev','images'], function() {
  browserSync.init({
    server: "_site",
    port: 2610
  });
});

/**
 * Compile files from _scss into both _site/css (for live injecting) and site (for future jekyll builds)
 */
gulp.task('sass', function () {
  return gulp.src('_sass/main.scss')
    .pipe(sass({
      includePaths: ['scss'],
      onError: browserSync.notify
    }))
    .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
    .pipe(browserSync.reload({stream:true}))
    .pipe(gulpIf('*.css', cleanCSS({compatibility: 'ie8'},{debug: true}, function(details) {
            console.log(details.name + ': ' + details.stats.originalSize);
            console.log(details.name + ': ' + details.stats.minifiedSize);
        })))
    .pipe(gulp.dest('_site/css'))
    .pipe(gulp.dest('css'));
});

/**
 * Watch scss files for changes & recompile 
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function () {
  gulp.watch(['_sass/**/*.scss','_sass/*.scss'], ['sass'], ['images']);
  gulp.watch(['index.html', '_layouts/*.html', '_posts/*', '_includes/*.html', '*.md'], ['jekyll-rebuild']);
});


/**
 * Build the Jekyll Site in production mode
 */
gulp.task('jekyll-prod', function (done) {
  browserSync.notify(messages.jekyllProd);
  return cp.spawn('jekyll', ['build'], {stdio: 'inherit'})
    .on('close', done);
});

/**
 * Compile files from _scss into both _site/css (for live injecting) and site (for future jekyll builds)
 */
gulp.task('sass-prod', function () {
  return gulp.src('_sass/main.scss')
    .pipe(sass({
      includePaths: ['scss', 'images'],
      onError: browserSync.notify
    }))
    .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
    .pipe(cssnano()) 
    .pipe(gulp.dest('_site/css'))
    .pipe(gulp.dest('css'));
});

gulp.task('images', function(){
  return gulp.src('_sass/**/*.+(png|jpg|jpeg|gif|svg)')
//  .pipe(imagemin({
//      // Setting interlaced to true
//      interlaced: true
//    }))
  .pipe(gulp.dest(''))
  .pipe(gulp.dest('_site'))
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', ['browser-sync', 'watch']);
gulp.task('build', ['sass-prod', 'jekyll-prod']);