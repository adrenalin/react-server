const config = require('../config')
const gulp = require('gulp')
const concat = require('gulp-concat')
const path = require('path')

const files = []
require('./copy-vendors')

Object.keys(config.vendors).map((key) => {
  const vendor = config.vendors[key]
  files.push(path.join('node_modules', key, vendor.source))
})

gulp.task('concat-vendors', () => {
  return gulp.src(files)
    .pipe(concat('vendors.js'))
    .pipe(gulp.dest(config.target.js))
})

gulp.task('tasks/concat-vendors', gulp.parallel('concat-vendors'), () => {

})
