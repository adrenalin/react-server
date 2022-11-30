const path = require('path')
const gulp = require('gulp')
const config = require('../config')

module.exports = function copyFonts () {
  const size = require('gulp-size')
  const stream = gulp.src([
    path.join(config.get('root'), config.get('assets.fonts'), '*.*'),
    path.join(config.get('root'), config.get('assets.fonts'), '**/*.*')
  ])
    .pipe(gulp.dest(path.join(config.get('root'), config.get('target.fonts'))))
    .pipe(size({
      title: 'Copied fonts'
    }))

  return stream
}
