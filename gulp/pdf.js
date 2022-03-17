const path = require('path')
const gulp = require('gulp')
const config = require('./config')
const gulpLoadPlugins = require('gulp-load-plugins')
const { errorHandler, successHandler } = require('./helpers')
const { exec } = require('child_process')

const g = gulpLoadPlugins()

gulp.task('watcher/pdf', () => {
  if (!process.env.TEMPLATE) {
    throw new Error('No `TEMPLATE` defined')
  }

  if (!process.env.DATA) {
    throw new Error('No `DATA` source defined')
  }

  if (!process.env.OUTPUT) {
    throw new Error('No `OUTPUT` destination defined')
  }

  return g.watch([
    path.join(config.root, 'config', '*'),
    path.join(config.root, 'config', '**', '*'),
    path.join(config.root, 'mockups', '*.js'),
    path.join(config.root, 'mockups', '**', '*.js'),
    path.join(config.root, 'pdfs', '*.js'),
    path.join(config.root, 'pdfs', '**', '*.js')
  ], gulp.series('build-pdf'))
})

gulp.task('build-pdf', (done) => {
  const args = [
    '/usr/bin/node',
    path.join(config.root, 'run.js'),
    'pdf',
    '--template', process.env.TEMPLATE,
    '--data', path.join(config.root, process.env.DATA),
    '--output', process.env.OUTPUT
  ]

  if (process.env.THEME) {
    args.push('--theme')
    args.push(process.env.THEME)
  }

  exec(args.join(' '), (err, stdout, stderr) => {
    console.log(stdout)
    const error = err
      ? err.message
      : (stderr || '').split('\n')[0]

    if (error) {
      console.log(stderr)
      const message = error
        .replace(`${config.root}/`, '')
        .replace(/^[a-zA-Z]+Error: /, '')

      errorHandler({
        name: 'PDF',
        message: `${message}`
      })

      return done(err)
    }

    successHandler({
      name: 'PDF',
      message: `PDF ready at "${process.env.OUTPUT}"`
    })

    done()
  })
})

gulp.task('pdf', gulp.parallel(['build-pdf', 'watcher/pdf']), () => {
})
