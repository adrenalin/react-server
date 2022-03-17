const path = require('path')
const gulp = require('gulp')
const cssNano = require('gulp-cssnano')
const gulpLoadPlugins = require('gulp-load-plugins')
const { successHandler, getState } = require('../helpers')
const config = require('../config')

// const debug = require('debug')('gulp/copy-images')
const g = gulpLoadPlugins()

const deps = []

let state = getState(deps)

gulp.task('minify-styles', () => {
  // Merge errors and start times from the dependencies
  state = getState(deps, 'minify-styles')

  const stream = gulp.src([
    path.join(config.target.css, '*.css'),
    '!' + path.join(config.target.css, '*.min.css')
  ])
    .pipe(cssNano({
      autoprefixer: false,
      discardComments: {
        removeAll: true
      },
      uniqueSelectors: false
    }))
    .pipe(g.rename((path) => {
      path.basename += '.min'
    }))
    .pipe(gulp.dest(config.target.css))
    .pipe(g.size({
      title: 'Minified client styles'
    }))
    .on('end', () => {
      state = getState(deps, 'minify-styles')
      successHandler({
        name: 'Building styles finished',
        message: `Finished in ${Math.round((Date.now() - state.start) / 100) / 10} s`
      })
    })

  return stream
})

gulp.task('tasks/minify-styles', gulp.series('minify-styles'), () => {
  // Standalone task execution from cli
})

// Return the state for communication with the initializer if needed
module.exports = () => {
  return state
}
