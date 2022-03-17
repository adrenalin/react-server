const path = require('path')
const gulp = require('gulp')
const gulpLoadPlugins = require('gulp-load-plugins')
const { getState } = require('../helpers')
const config = require('../config')

const g = gulpLoadPlugins()

// Dependencies and the initial state object
const deps = []
let state = getState(deps, 'copy-error-pages')

gulp.task('copy-error-pages', () => {
  state = getState(deps, 'copy-error-pages')

  const stream = gulp.src([
    path.join(config.assets.files, '@adrenalin/errors', '*.html')
  ])
    .pipe(gulp.dest(config.target.static))
    .pipe(g.size({
      title: 'Copied error pages'
    }))

  return stream
})

gulp.task('tasks/copy-error-pages', gulp.series('copy-error-pages'), () => {
  // Standalone task execution from cli
})

// Return the state for communication with the initializer if needed
module.exports = () => {
  return state
}
