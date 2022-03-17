const path = require('path')
const gulp = require('gulp')
const gulpLoadPlugins = require('gulp-load-plugins')
const replace = require('gulp-replace')
const { getState, errorHandler } = require('../helpers')
const config = require('../config')

// const debug = require('debug')('gulp/copy-images')
const g = gulpLoadPlugins()

let state = getState()

gulp.task('compile-styles', (done) => {
  state = getState([], 'compile-styles')

  const stream = gulp.src(path.join(config.assets.css, '*.scss'))
    .pipe(g.sourcemaps.init())
    .pipe(
      g.sass()
        // .on('error', g.sass.logError)
        .on('error', function (err) {
          const filename = err.file.substr(config.assets.css.length + 1).replace(/\.scss/, '')
          const error = new Error(`${filename}:${err.line}: ${err.messageOriginal}`)
          errorHandler(error)
          console.log('error', err)
          // g.sass.logError(...args)
          done()
        })
    )
    .pipe(replace(/\\a\s+/g, ' '))
    .pipe(g.sourcemaps.write())
    .pipe(gulp.dest(config.target.css))
    .pipe(g.size({
      title: 'Client styles'
    }))

  return stream
})

gulp.task('tasks/compile-styles', gulp.series('compile-styles'), () => {
  // Standalone task execution from cli
})

// Return the state for communication with the initializer if needed
module.exports = () => {
  return state
}
