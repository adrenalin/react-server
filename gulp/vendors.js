const gulp = require('gulp')
require('./tasks/concat-vendors')

gulp.task('vendors', gulp.parallel(['concat-vendors']), () => {

})
