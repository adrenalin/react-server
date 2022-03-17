const gulp = require('gulp')
const config = require('./config')
const { errorHandler, successHandler, getState } = require('./helpers')

// Require dependencies
const deps = [
  require('./tasks/build-client'),
  require('./tasks/concat-vendors'),
  require('./tasks/copy-vendors'),
  require('./tasks/copy-error-pages'),
  require('./tasks/copy-files'),
  require('./tasks/copy-fonts'),
  require('./tasks/copy-images'),
  require('./tasks/copy-js'),
  require('./tasks/fusebox'),
  require('./tasks/compile-styles')
]

const tasks = [
  'build-client',
  'concat-vendors',
  'compile-styles',
  'copy-error-pages',
  'copy-files',
  'copy-fonts',
  'copy-images',
  'copy-js',
  'fusebox'
]

if (config.apidoc && config.apidoc.build) {
  require('./tasks/build-apidoc')
  tasks.push('build-apidoc')
}

gulp.task('build', gulp.parallel(tasks), () => {
  const state = getState(deps, 'build')

  if (state.errors && state.errors.length) {
    return state.errors.forEach((err) => {
      if (typeof err === 'string') {
        return errorHandler({
          name: 'Build error',
          message: err
        })
      }

      errorHandler(err)
    })
  }

  successHandler({
    name: 'Build finished',
    message: `Finished in ${Math.round((Date.now() - state.start) / 100) / 10} s`
  })
})
