const path = require('path')
const gulp = require('gulp')
const size = require('gulp-size')
const config = require('../config')

module.exports = function copyFiles () {
  const stream = gulp.src([
    path.join(config.get('root'), config.get('assets.files'), '*'),
    path.join(config.get('root'), config.get('assets.files'), '**/*')
  ])
    .pipe(gulp.dest(path.join(config.get('root'), config.get('target.files'))))
    .pipe(size({
      title: 'Copied files'
    }))

  return stream
}
