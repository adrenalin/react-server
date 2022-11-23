const path = require('path')
const gulp = require('gulp')
const size = require('gulp-size')
const config = require('../config')

module.exports = function copyImages () {
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
