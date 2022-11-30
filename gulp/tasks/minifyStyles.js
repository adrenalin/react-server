const path = require('path')
const gulp = require('gulp')
const config = require('../config')

module.exports = function minifyStyles () {
  const cssNano = require('gulp-cssnano')
  const rename = require('gulp-rename')
  const size = require('gulp-size')

  // Merge errors and start times from the dependencies
  const stream = gulp.src([
    path.join(config.get('root'), config.get('target.css'), '*.css'),
    '!' + path.join(config.get('root'), config.get('target.css'), '*.min.css')
  ])
    .pipe(cssNano({
      autoprefixer: false,
      discardComments: {
        removeAll: true
      },
      uniqueSelectors: false
    }))
    .pipe(rename((path) => {
      path.basename += '.min'
    }))
    .pipe(gulp.dest(path.join(config.get('root'), config.get('target.css'))))
    .pipe(size({
      title: 'Minified client styles'
    }))

  return stream
}
