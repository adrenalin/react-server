const gulp = require('gulp')
const config = require('./config')

// Load tasks
const { compileStyles, concatVendors, copyFiles, copyFonts, copyImages, copyJS, bundler, lintSCSS } = require('./tasks')

const tasks = [
  concatVendors,
  compileStyles,
  copyFiles,
  copyFonts,
  copyImages,
  copyJS,
  bundler
]

if (config.get('sass.lint')) {
  tasks.push(lintSCSS)
}
if (config.get('build.client')) {
  const buildClient = require('./tasks/buildClient')
  tasks.push(buildClient)
}

if (config.get('apidoc.build')) {
  const buildAPIdoc = require('./tasks/buildApiDoc')
  tasks.push(buildAPIdoc)
}

module.exports = gulp.parallel(tasks)
