const gulp = require('gulp')

const { minifyJS, minifyStyles } = require('./tasks')
module.exports = gulp.parallel([
  minifyJS,
  minifyStyles
])
