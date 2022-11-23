const path = require('path')
const gulp = require('gulp')
const config = require('../config')
const { getValue } = require('@adrenalin/helpers.js')

module.exports = function copyVendors () {
  const vendors = getValue(config, 'build.vendors')

  if (!vendors || !Object.keys(vendors).length) {
    return Promise.resolve()
  }

  const vendorFiles = Object.keys(vendors).map((pkg) => {
    return `./node_modules/${pkg}/${vendors[pkg].source}`
  })

  return gulp.src(vendorFiles)
    .pipe(gulp.dest(path.join(config.get('root'), config.get('target.js'))))
}
