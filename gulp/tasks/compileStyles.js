const path = require('path')
const gulp = require('gulp')
const size = require('gulp-size')
const sourcemaps = require('gulp-sourcemaps')
const notify = require('../lib/notify')
const config = require('../config')
const sass = require('gulp-sass')(require(config.get('sass.module')))

const target = path.join(config.get('root'), config.get('target.css'))

module.exports = function compileStyles () {
  const stream = gulp.src(path.join(config.get('root'), config.get('assets.css'), '*.scss'))
    .pipe(sourcemaps.init())
    .pipe(sass())
    .on('error', (err) => {
      notify({
        title: `${err.relativePath}: ${err.line}:${err.column}`,
        message: `${err.messageOriginal}`
      })
      stream.emit('error', err)
    })
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(target))
    .pipe(
      size({
        title: 'Client styles'
      })
    )
    .on('error', (err) => {
      if (config.get('exitOnError')) {
        stream.emit('error', err)
      }
    })

  return stream
}
