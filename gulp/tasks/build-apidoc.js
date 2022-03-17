const gulp = require('gulp')
const apidoc = require('gulp-apidoc')
const { getState } = require('../helpers')
const config = require('../config')

let state = getState()

const deps = []

// Build client that uses ES6 + JSX
gulp.task('build-apidoc', (done) => {
  state = getState(deps, 'build-apidoc')

  apidoc({
    // debug: true,
    src: config.apidoc.source,
    dest: config.apidoc.target
  }, done)
})

gulp.task('tasks/build-apidoc', gulp.series('build-apidoc'), () => {
})

module.exports = () => {
  return state
}
