var gulp        = require('gulp');
var browserSync = require('browser-sync').create();
var sass        = require('gulp-sass')(require('sass'));
var prefix      = require('gulp-autoprefixer');
var cp          = require('child_process');
var cssnano 		= require('gulp-cssnano');

var jekyll   = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';
var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn( jekyll , ['build'], {stdio: 'inherit'})
        .on('close', done);
});

/**
 * Build the Jekyll Site including the pages from _drafts
 */
 gulp.task('jekyll-build-drafts', function (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn( jekyll , ['build', '--drafts'], {stdio: 'inherit'})
        .on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', gulp.series('jekyll-build', function (cb) {
    browserSync.reload();
    cb();
}));

/**
 * Compile files from _scss into both _site/css (for live injecting) and site (for future jekyll builds)
 */
 gulp.task('sass', function () {
    return gulp.src('assets/scss/style.scss')
        .pipe(sass({
            includePaths: ['scss'],
            onError: browserSync.notify
        }))
        .pipe(prefix(['last 3 versions'], { cascade: true }))
				.pipe(cssnano())
        .pipe(gulp.dest('_site/assets/css'))
        .pipe(browserSync.reload({stream:true}))
        .pipe(gulp.dest('assets/css'));
});

/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('browser-sync', gulp.series('sass', 'jekyll-build', function(cb) {
    browserSync.init({
        server: {
            baseDir: '_site'
        }
    });
    cb();
}));

/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function (cb) {
    gulp.watch(['assets/scss/*.scss', 'assets/scss/*/*.scss'], gulp.series('sass'));
    gulp.watch(['*.html', '_layouts/*.html', '_posts/*', '_includes/*'], gulp.series('jekyll-rebuild'));
    cb();
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', gulp.series('browser-sync', 'watch'));

/**
 * Run `gulp drafts` for a start which also cimpiles/includes the draft pages
 * Note after a change in a watched file triggers a rebuild the draft pages aren't included anymore
 */
gulp.task('drafts', gulp.series('browser-sync', 'jekyll-build-drafts', 'watch'));
