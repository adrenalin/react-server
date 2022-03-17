const path = require('path')
const gulp = require('gulp')
const terser = require('gulp-terser')
const rename = require('gulp-rename')
const config = require('../config')

gulp.task('minify-js', () => {
  const targetPaths = [
    path.join(config.target.js, `${config.environment}.js`),
    path.join(config.target.js, 'vendors.js')
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
    .pipe(gulp.dest(config.target.js))
})

gulp.task('tasks/minify-js', gulp.series('minify-js'), () => {
  // Standalone task execution from cli
})
