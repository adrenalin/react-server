const path = require('path')
const gulp = require('gulp')
const gulpLoadPlugins = require('gulp-load-plugins')
const { getState } = require('../helpers')
const config = require('../config')

const g = gulpLoadPlugins()

// Dependencies and the initial state object
const deps = []
let state = getState(deps, 'copy-js')

gulp.task('copy-js', () => {
  state = getState(deps, 'copy-js')

  const stream = gulp.src([
    path.join(config.assets.js, '*.*'),
    path.join(config.assets.js, '**/*.*')
  ])
    .pipe(gulp.dest(config.target.js))
    .pipe(g.size({
      title: 'Copied js'
    }))

  return stream
})

gulp.task('tasks/copy-js', gulp.series('copy-js'), () => {
  // Standalone task execution from cli
})

// Return the state for communication with the initializer if needed
module.exports = () => {
  return state
}
