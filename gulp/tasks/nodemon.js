const path = require('path')
const gulp = require('gulp')
const config = require('../config')
const { successHandler } = require('../helpers')
const nodemon = require('nodemon')

gulp.task('nodemon', () => {
  restartNodemon()
})

gulp.task('tasks/nodemon', gulp.series('nodemon'), () => {

})

const restartNodemon = () => {
  if (this.rs) {
    clearTimeout(this.rs)
  }

  // Add timed restart to allow some time for the scripts to finish
  this.rs = setTimeout(() => {
    nodemonInstance().emit('restart')
  }, 200)
}

const nodemonInstance = () => {
  if (this.nodemonInstance) {
    return this.nodemonInstance
  }

  // Start nodemon
  this.nodemonInstance = nodemon({
    execMap: {
      js: 'babel-node'
    },
    script: path.join(config.root, 'index.js'),
    env: {
      NODE_ENV: process.env.NODE_ENV || 'dev'
    },
    ignore: ['*']
  })
    .on('start', () => {
      successHandler({
        title: config.project || 'Nodemon',
        message: 'Restarted',
        sound: true
      })
    })
    .on('error', (err) => {
      console.log('Restart failed', err)
    })

  return this.nodemonInstance
}
