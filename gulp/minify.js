const gulp = require('gulp')

require('./tasks/minify-js')
require('./tasks/minify-styles')

gulp.task('minify', gulp.parallel(['minify-js', 'minify-styles']), (done) => {
  done()
})
