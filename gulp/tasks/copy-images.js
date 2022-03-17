const path = require('path')
const gulp = require('gulp')
const gulpLoadPlugins = require('gulp-load-plugins')
const { getState } = require('../helpers')
const config = require('../config')

const g = gulpLoadPlugins()

// Dependencies and the initial state object
const deps = []
let state = getState(deps, 'copy-images')

gulp.task('copy-images', () => {
  state = getState(deps, 'copy-images')

  const stream = gulp.src([
    path.join(config.assets.images, '*.*'),
    path.join(config.assets.images, '**/*.*')
  ])
    .pipe(gulp.dest(config.target.images))
    .pipe(g.size({
      title: 'Copied images'
    }))

  return stream
})

gulp.task('tasks/copy-images', gulp.series('copy-images'), () => {
  // Standalone task execution from cli
})

// Return the state for communication with the initializer if needed
module.exports = () => {
  return state
}
