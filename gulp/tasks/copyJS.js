const path = require('path')
const gulp = require('gulp')
const config = require('../config')
const size = require('gulp-size')

module.exports = function copyJS () {
  const stream = gulp.src([
    path.join(config.get('root'), config.get('assets.js'), '*.*'),
    path.join(config.get('root'), config.get('assets.js'), '**/*.*')
  ])
    .pipe(gulp.dest(path.join(config.get('root'), config.get('target.js'))))
    .pipe(size({
      title: 'Copied js'
    }))

  return stream
}
