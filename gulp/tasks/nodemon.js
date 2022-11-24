const path = require('path')
const gulp = require('gulp')
const nodemon = require('nodemon')
const config = require('../config')
const notify = require('../lib/notify')

const nodemonConfig = {
  execMap: {
    js: config.get('nodemon.binary', 'node')
  },
  script: path.join(config.get('root'), config.get('main', 'index.js')),
  env: {
    NODE_ENV: config.get('node.env', 'dev')
  },
  ignore: ['*']
}

let timeout

const restartNodemon = () => {
  if (timeout) {
    clearTimeout(timeout)
  }

  // Add timed restart to allow some time for the scripts to finish
  timeout = setTimeout(() => {
    nodemonInstance().emit('restart')
  }, 200)
}

const nodemonInstance = () => {
  if (this.nodemonInstance) {
    return this.nodemonInstance
  }

  // Start nodemon
  this.nodemonInstance = nodemon(nodemonConfig)
    .on('start', () => {
      notify({
        title: config.get('name', 'Nodemon'),
        message: 'Nodemon restarted'
      })
    })
    .on('error', (err) => {
      notify({
        title: config.get('name', 'Nodemon'),
        message: err.message
      })
    })

  return this.nodemonInstance
}

module.exports = function nodemonTask () {
  restartNodemon()
}
