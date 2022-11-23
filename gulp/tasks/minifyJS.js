const path = require('path')
const gulp = require('gulp')
const terser = require('gulp-terser')
const rename = require('gulp-rename')
const config = require('../config')

module.exports = () => {
  const targetPaths = [
    path.join(config.get('root'), config.get('target.js'), '*.js'),
    '!' + path.join(config.get('root'), config.get('target.js'), 'vendors.js'),
    '!' + path.join(config.get('root'), config.get('target.js'), '*.min.js')
  ]

  return gulp.src(targetPaths)
    .pipe(terser({
      compress: {
        arguments: true,
        booleans: true,
        drop_console: true
      },
      keep_classnames: true,
      keep_fnames: true
    }))
    .pipe(
      rename({
        extname: '.min.js'
      })
    )
    .pipe(gulp.dest(path.join(config.get('root'), config.get('target.js'))))
}
