const gulp = require('gulp')
const config = require('./config')
const path = require('path')
const brotli = require('gulp-brotli')

gulp.task('brotli', () => {
  const paths = [
    path.join(config.target.static, '*'),
    path.join(config.target.static, '**', '*'),
    '!' + path.join(config.target.static, '*.zz'),
    '!' + path.join(config.target.static, '**', '*.zz'),
    '!' + path.join(config.target.static, '*.gz'),
    '!' + path.join(config.target.static, '**', '*.gz')
  ]

  gulp.src(paths, { follow: false })
    .pipe(brotli.compress({ extension: 'zz' }))
    .pipe(gulp.dest(config.target.static))
  // successHandler({
  //   name: 'Build finished',
  //   message: `Finished in ${Math.round((Date.now() - state.start) / 100) / 10} s`
  // })
})
