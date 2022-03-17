const path = require('path')
const gulp = require('gulp')
const gulpLoadPlugins = require('gulp-load-plugins')
const { getState } = require('../helpers')
const config = require('../config')

const g = gulpLoadPlugins()

// Dependencies and the initial state object
const deps = []
let state = getState(deps, 'copy-files')

gulp.task('copy-files', () => {
  state = getState(deps, 'copy-files')

  const stream = gulp.src([
    path.join(config.assets.files, '*.*'),
    path.join(config.assets.files, '**/*.*')
  ])
    .pipe(gulp.dest(config.target.files))
    .pipe(g.size({
      title: 'Copied files'
    }))

  return stream
})

gulp.task('tasks/copy-files', gulp.series('copy-files'), () => {
  // Standalone task execution from cli
})

// Return the state for communication with the initializer if needed
module.exports = () => {
  return state
}
