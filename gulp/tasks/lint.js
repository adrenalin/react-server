const path = require('path')
const gulp = require('gulp')
const config = require('../config')
const eslint = require('gulp-eslint')
const debug = require('debug')('gulp/lint')
const { errorHandler, getState } = require('../helpers')

const env = config.environment

let state = {
  start: null,
  errors: []
}

gulp.task('lint', () => {
  state = getState([], 'lint')

  const stream = gulp.src([
    path.join(config.clients[env].path, '*.js'),
    path.join(config.clients[env].path, '**', '*.js')
  ])
    .pipe(eslint(config.eslint))
    .pipe(eslint.format())
    .pipe(eslint.result((res) => {
      if (!res.errorCount) {
        return
      }

      res.messages.map((message, i) => {
        if (message.severity < 2) {
          return null
        }

        state.errors.push({
          title: res.filePath ? res.filePath.substr(config.appRoot.length + 1) : 'Lint',
          message: `${message.message} on ${message.line}`
        })
      })

      // Had errors, display first of them
      if (state.errors.length) {
        errorHandler(state.errors[0])
      }

      stream.emit('end')
    }))
    .on('error', (err) => {
      debug('err', err)
    })

  return stream
})

gulp.task('tasks/lint', gulp.series('lint'), () => {
  // Standalone task execution from cli
})

// Return the state for communication with the initializer if needed
module.exports = () => {
  return state
}
