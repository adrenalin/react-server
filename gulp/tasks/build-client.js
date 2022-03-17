const fs = require('fs')
const path = require('path')
const gulp = require('gulp')
const gulpLoadPlugins = require('gulp-load-plugins')
const { getState, errorHandler } = require('../helpers')
const config = require('../config')

const g = gulpLoadPlugins()

let state = getState()

const deps = []

const babelrcRaw = fs.readFileSync(path.join(process.env.PROJECT_ROOT, '.babelrc'))
const babelrc = JSON.parse(babelrcRaw)

// Build client that uses ES6 + JSX
gulp.task('build-client', () => {
  return new Promise((resolve, reject) => {
    const env = config.environment
    const buildEnvironment = config.clients[env]

    if (!buildEnvironment || !buildEnvironment.build) {
      return resolve()
    }

    state = getState(deps, 'build-client')
    const stream = gulp
      .src([
        path.join(config.clients.root, '*.js'),
        path.join(config.clients.root, '**', '*.js')
      ])
      .pipe(g.babel(babelrc))
      .on('error', (err) => {
        const filename = err.fileName.substr(config.root.length + 1)
        errorHandler({
          title: filename,
          message: err.message.substr(err.fileName.length + 2)
        })
        console.error('Caught an error', err)
        state.errors.push(err)
        stream.emit('end')
        reject(err)
      })
      .pipe(gulp.dest(config.target.client))
      .pipe(g.size({
        title: 'Client JS'
      }))
      .pipe({
        on: (eventName, cb, err) => {
          switch (eventName) {
            case 'error':
              console.error('error', err)
              break
          }
          resolve()
        },
        write: () => {},
        end: () => {}
      })
  })
})

gulp.task('tasks/build-client', gulp.series('build-client'), () => {
})

module.exports = () => {
  return state
}
