const path = require('path')
const EventEmitter = require('node:events')
const ServerConfig = require('@vapaaradikaali/helpers.js/lib/ServerConfig')

const moduleRoot = path.join(__dirname, '..', '..')
const clientRoot = process.cwd()

// Get the client package.json
const pkg = require(path.join(clientRoot, 'package.json'))

const config = new ServerConfig()

config
  .setSchema(require(path.join(moduleRoot, 'schemas', 'gulp.json')))
  .loadFile(path.join(moduleRoot, 'config', 'gulp'))
  .set('name', pkg.name)
  .set('main', pkg.main)
  .set('root', clientRoot)

config
  .loadFile(path.join(clientRoot, 'config', 'gulp'), true)
  .loadFile(path.join(clientRoot, 'config', 'local-gulp'), true)

config.events = new EventEmitter()

module.exports = config
