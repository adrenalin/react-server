const fs = require('fs')
const path = require('path')
const gulp = require('gulp')
const babel = require('gulp-babel')
const size = require('gulp-size')
const notify = require('../lib/notify')
const config = require('../config')

const babelrcRaw = fs.readFileSync(path.join(config.get('root'), '.babelrc'))
const babelrc = JSON.parse(babelrcRaw)

// Build client that uses ES6 + JSX
module.exports = function buildClient () {
  return new Promise((resolve, reject) => {
    const stream = gulp
      .src([
        path.join(config.get('root'), config.get('clients.root'), '*.js'),
        path.join(config.get('root'), config.get('clients.root'), '**', '*.js')
      ])
      .pipe(babel(babelrc))
      .on('error', (err) => {
        notify({
          title: `${config.get('name.build-client')}: build-client`,
          message: err.message
        })

        console.error(err)
        console.error(err.stack)

        stream.emit('end')
        reject(err)
      })
      .pipe(gulp.dest(path.join(config.get('root'), config.get('target.client'))))
      .pipe(size({
        title: 'Client JS'
      }))
      .pipe({
        on: (eventName, cb, err) => {
          switch (eventName) {
            case 'error':
              notify({
                title: `${config.get('name', 'build-client')}: build-client`,
                message: err.message
              })
              console.error(err)
              console.error(err.stack)
              break
          }
          resolve()
        },
        write: () => {},
        end: () => {}
      })
  })
}
