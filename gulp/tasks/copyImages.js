const path = require('path')
const gulp = require('gulp')
const config = require('../config')

module.exports = function copyImages () {
  const size = require('gulp-size')
  const stream = gulp.src([
    path.join(config.get('root'), config.get('assets.images'), '*.*'),
    path.join(config.get('root'), config.get('assets.images'), '**/*.*')
  ])
    .pipe(gulp.dest(path.join(config.get('root'), config.get('target.images'))))
    .pipe(size({
      title: 'Copied images'
    }))

  return stream
}
