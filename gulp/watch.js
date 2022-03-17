const path = require('path')
const gulp = require('gulp')
const config = require('./config')
const gulpLoadPlugins = require('gulp-load-plugins')
const { errorHandler } = require('./helpers')

const g = gulpLoadPlugins()

// Register scripts needed for building
require('./build')
require('./tasks/copy-files')
require('./tasks/copy-fonts')
require('./tasks/copy-images')
require('./tasks/copy-js')
require('./tasks/fusebox')
require('./tasks/compile-styles')
require('./tasks/minify-styles')
require('./tasks/minify-js')
require('./tasks/nodemon')
require('./tasks/concat-vendors')

gulp.task('watcher/build-client', () => {
  return g.watch([
    path.join(config.clients.root, '*.js'),
    path.join(config.clients.root, '**', '*.js')
  ], gulp.series('build-client'))
})

gulp.task('watcher/copy-files', () => {
  return g.watch([
    path.join(config.assets.files, '*.*'),
    path.join(config.assets.files, '**/*.*')
  ], gulp.series('copy-files'))
})

gulp.task('watcher/copy-fonts', () => {
  return g.watch([
    path.join(config.assets.fonts, '*.*'),
    path.join(config.assets.fonts, '**/*.*')
  ], gulp.series('copy-fonts'))
})

gulp.task('watcher/copy-images', () => {
  return g.watch([
    path.join(config.assets.images, '*.*'),
    path.join(config.assets.images, '**/*.*')
  ], gulp.series('copy-images'))
})

gulp.task('watcher/copy-js', () => {
  const tasks = ['copy-js']

  if (!config.development) {
    tasks.push('tasks/concat-vendors')
  }

  return g.watch([
    path.join(config.assets.js, '*.*'),
    path.join(config.assets.js, '**/*.*')
  ], gulp.series(tasks))
})

gulp.task('watcher/build-apidoc', () => {
  if (config.apidoc && config.apidoc.watch) {
    require('./tasks/build-apidoc')
    return g.watch([
      path.join(config.apidoc.source, '*.js'),
      path.join(config.apidoc.source, '**', '*.js')
    ], gulp.series('build-apidoc'))
  }
})

gulp.task('watcher/client', () => {
  // Watch JS changes
  const tasks = ['fusebox']

  if (!config.development) {
    tasks.push('minify-js')
  }

  const w = g.watch([
    path.join(config.clients.root, '*.js'),
    path.join(config.clients.root, '**', '*.js')
  ], gulp.series(tasks))

  w.on('change', (p, s) => {
    p = p.substr(config.root.length + 1)
    const stream = gulp.src(p)
      .pipe(g.babel())
      .on('error', (err) => {
        errorHandler({
          name: config.project || 'Babel',
          message: `${p}: ${err.message.replace(/^.+?:.+?: (.+)[\r\n].+$/g, '$1')}`,
          sound: true
        })
        stream.emit('end')
      })
      .pipe(gulp.dest(path.dirname(`${config.target.root}/${p}`)))
      .pipe(g.size({
        title: p
      }))
  })

  return w
})

gulp.task('watcher/compile-styles', () => {
  // Watch SCSS changes
  const t = [
    'compile-styles'
  ]

  if (process.env.USE_MINIFIED) {
    t.push('minify-styles')
  }

  g.watch([
    path.join(config.assets.css, '*.scss'),
    path.join(config.assets.css, '**', '*.scss')
  ], gulp.series(t))
})

gulp.task('watcher/nodemon', () => {
  g.watch([
    path.join(config.root, 'config', '*.js'),
    path.join(config.root, 'config', '**', '*.js'),
    path.join(config.root, 'config', '*.yml'),
    path.join(config.root, 'config', '**', '*.yml'),
    path.join(config.root, 'lib', '*.js'),
    path.join(config.root, 'lib', '**', '*.js'),
    path.join(config.root, 'pdfs', '*.js'),
    path.join(config.root, 'pdfs', '**', '*.js'),
    path.join(config.root, 'routes', '*.js'),
    path.join(config.root, 'routes', '**', '*.js'),
    path.join(config.root, 'server', '*.js'),
    path.join(config.root, 'server', '**', '*.js'),
    path.join(config.root, 'services', '*.js'),
    path.join(config.root, 'services', '**', '*.js'),
    path.join(config.clients.root, '*.js'),
    path.join(config.clients.root, '**', '*.js')
  ], gulp.series('nodemon'), () => {
  })
})

const watchTasks = [
  'build',
  'watcher/build-client',
  'watcher/copy-files',
  'watcher/copy-fonts',
  'watcher/copy-images',
  'watcher/copy-js',
  'watcher/build-apidoc',
  'watcher/client',
  'watcher/compile-styles',
  'watcher/nodemon',
  'nodemon'
]

gulp.task('watch', gulp.parallel(watchTasks), () => {
})
