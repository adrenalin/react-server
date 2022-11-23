const gulp = require('gulp')
const concatVendors = require('./tasks/concatVendors')

module.exports = gulp.parallel([concatVendors])
