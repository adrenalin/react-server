const gulp = require('gulp')
const config = require('../config')

gulp.task('copy-vendors', () => {
  const vendors = config.vendors

  if (!vendors || !Object.keys(vendors).length) {
    console.log('No vendors', vendors)
    return Promise.resolve()
  }

  const vendorFiles = Object.keys(vendors).map((pkg) => {
    return `./node_modules/${pkg}/${vendors[pkg].source}`
  })

  return gulp.src(vendorFiles)
    .pipe(gulp.dest(config.target.js))
})

gulp.task('tasks/copy-vendors', gulp.series('copy-vendors'), () => {
})
