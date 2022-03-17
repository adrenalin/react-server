const path = require('path')
const gulp = require('gulp')
const gulpLoadPlugins = require('gulp-load-plugins')
const { getState } = require('../helpers')
const config = require('../config')

const g = gulpLoadPlugins()

// Dependencies and the initial state object
const deps = []
let state = getState(deps, 'copy-fonts')

gulp.task('copy-fonts', () => {
  state = getState(deps, 'copy-fonts')

  const stream = gulp.src([
    path.join(config.assets.fonts, '*.*'),
    path.join(config.assets.fonts, '**/*.*')
  ])
    .pipe(gulp.dest(config.target.fonts))
    .pipe(g.size({
      title: 'Copied fonts'
    }))

  return stream
})

gulp.task('tasks/copy-fonts', gulp.series('copy-fonts'), () => {
  // Standalone task execution from cli
})

// Return the state for communication with the initializer if needed
module.exports = () => {
  return state
}
