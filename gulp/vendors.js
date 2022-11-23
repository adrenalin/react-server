const gulp = require('gulp')
const concatVendors = require('./tasks/concatVendors')

module.exports = function vendors () {
  return gulp.parallel([
    concatVendors
  ])
}
