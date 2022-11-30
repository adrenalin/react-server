const gulp = require('gulp')
const jsDoc = require('gulp-jsdoc3')
const config = require('../config')

module.exports = function jsdoc () {
  const options = {
    ...config.get('jsdoc.options', {})
  }

  return gulp
    .src(config.get('jsdoc.paths'))
    .pipe(jsDoc(options))
    .pipe(config.get('target.jsdoc'))
}
