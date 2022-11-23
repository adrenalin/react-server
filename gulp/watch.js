const path = require('path')
const gulp = require('gulp')
const gulpWatch = require('gulp-watch')
const config = require('./config')

// Register scripts needed for building

const build = require('./build')
const { buildApiDoc, bundler, compileStyles, concatVendors, copyFiles, copyFonts, copyImages, copyJS, lintSCSS, minifyJS, minifyStyles, nodemon } = require('./tasks')

function buildClientWatcher () {
  if (!config.get('build.client', false)) {
    return
  }

  return gulpWatch([
    path.join(config.get('root'), config.get('clients.root'), '*.js'),
    path.join(config.get('root'), config.get('clients.root'), '**', '*.js')
  ], gulp.series(buildClient))
}

function compileStylesWatcher () {
  // Watch SCSS changes
  const t = [
    lintSCSS,
    compileStyles
  ]

  if (config.get('minify')) {
    t.push(minifyStyles)
  }

  return gulpWatch([
    path.join(config.get('root'), config.get('assets.css'), '*.scss'),
    path.join(config.get('root'), config.get('assets.css'), '**', '*.scss')
  ], gulp.parallel(t))
}

function copyFilesWatcher () {
  return gulpWatch([
    path.join(config.get('root'), config.get('assets.files'), '*.*'),
    path.join(config.get('root'), config.get('assets.files'), '**/*.*')
  ], gulp.series(copyFiles))
}

function copyFontsWatcher () {
  return gulpWatch([
    path.join(config.get('root'), config.get('assets.fonts'), '*.*'),
    path.join(config.get('root'), config.get('assets.fonts'), '**/*.*')
  ], gulp.series(copyFonts))
}

function copyImagesWatcher () {
  return gulpWatch([
    path.join(config.get('root'), config.get('assets.images'), '*.*'),
    path.join(config.get('root'), config.get('assets.images'), '**/*.*')
  ], gulp.series(copyImages))
}

function copyJSWatcher () {
  const tasks = [copyJS]

  return gulpWatch([
    path.join(config.get('root'), config.get('assets.js'), '*.*'),
    path.join(config.get('root'), config.get('assets.js'), '**/*.*')
  ], gulp.series(tasks))
}

function buildApiDocWatcher () {
  if (!config.get('build.apidoc', false)) {
    return Promise.resolve()
  }

  return gulpWatch([
    path.join(config.get('root'), config.get('apidoc.source'), '*.js'),
    path.join(config.get('root'), config.get('apidoc.source'), '**', '*.js')
  ], gulp.series(buildApiDoc))
}

function clientWatcher () {
  // Watch JS changes
  const tasks = [build]

  if (config.get('minify')) {
    tasks.push(minifyJS)
  }

  return gulpWatch([
    path.join(config.get('root'), config.get('clients.root'), '*.js'),
    path.join(config.get('root'), config.get('clients.root'), '**', '*.js')
  ], gulp.series(tasks))
}

function nodemonWatcher () {
  if (!config.get('nodemon.enabled')) {
    return Promise.resolve()
  }

  return gulpWatch([
    path.join(config.get('root'), config.get('clients.root'), '*.js'),
    path.join(config.get('root'), config.get('clients.root'), '**', '*.js'),

    // Config changes
    path.join(config.get('root'), 'config', '*.yml'),

    // Lib file changes
    path.join(config.get('root'), 'lib', '*.js'),
    path.join(config.get('root'), 'lib', '**', '*.js'),

    // Router changes
    path.join(config.get('root'), 'routers', '*.js'),
    path.join(config.get('root'), 'routers', '**', '*.js'),

    // Server file changes
    path.join(config.get('root'), 'server', '*.js'),
    path.join(config.get('root'), 'server', '**', '*.js'),

    // Service changes
    path.join(config.get('root'), 'services', '*.js'),
    path.join(config.get('root'), 'services', '**', '*.js')
  ], gulp.series([nodemon]))
}

const watchTasks = [
  build,
  buildApiDocWatcher,
  buildClientWatcher,
  clientWatcher,
  compileStylesWatcher,
  copyFilesWatcher,
  copyFontsWatcher,
  copyImagesWatcher,
  copyJSWatcher,
  nodemonWatcher
]

if (config.get('nodemon.enabled')) {
  watchTasks.push(nodemon)
}

module.exports = gulp.parallel(watchTasks)
