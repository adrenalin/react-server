const config = require('../config')
const gulp = require('gulp')
const path = require('path')

const files = []

const vendors = config.get('vendors', {})

Object.keys(vendors).forEach((key) => {
  const vendor = vendors[key]
  files.push(path.join('node_modules', key, vendor.source))
})

module.exports = function concatVendors () {
  if (!files.length) {
    console.warn('No vendors specified, nothing to do in tasks/concatVendors')
    return Promise.resolve()
  }

  const concat = require('gulp-concat')

  return gulp.src(files)
    .pipe(concat('vendors.js'))
    .pipe(gulp.dest(path.join(config.get('root'), config.get('target.js'))))
}
