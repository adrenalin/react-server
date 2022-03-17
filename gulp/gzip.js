const gulp = require('gulp')
const config = require('./config')
const path = require('path')
const gzip = require('gulp-gzip')

gulp.task('gzip', () => {
  const paths = [
    path.join(config.target.static, '*'),
    path.join(config.target.static, '**', '*'),
    '!' + path.join(config.target.static, '*.zz'),
    '!' + path.join(config.target.static, '**', '*.zz'),
    '!' + path.join(config.target.static, '*.gz'),
    '!' + path.join(config.target.static, '**', '*.gz')
  ]

  gulp.src(paths, { followSymLinks: false })
    .pipe(gzip({ append: true }))
    .pipe(gulp.dest(config.target.static))
  // successHandler({
  //   name: 'Build finished',
  //   message: `Finished in ${Math.round((Date.now() - state.start) / 100) / 10} s`
  // })
})
