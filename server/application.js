const path = require('path')
const EventEmitter = require('events')
const Logger = require('@adrenalin/logger')
const helpers = require('@adrenalin/helpers.js')

const getValue = helpers.getValue

module.exports = async (opts = {}) => {
  const options = opts || {}

  const logger = new Logger('Application')
  logger.setLevel(5)
  logger.info('Start initializing application')

  const app = require('express')()
  app.disable('x-powered-by')
  app.APPLICATION_ROOT = getValue(options, 'applicationRoot', path.join(__dirname, '..'))
  app.environment = process.env.ENVIRONMENT || 'public'
  app.helpers = helpers

  app.IS_DEVELOPMENT = ['dev', 'development'].includes(process.env.NODE_ENV)
  app.CLIENT_ROOT = path.join(app.APPLICATION_ROOT, 'build', 'client', helpers.Localization.toCase(app.environment, 'title'))
  app.STATIC_ROOT = path.join(app.APPLICATION_ROOT, 'build', 'static')
  app.events = new EventEmitter()

  app.environment = helpers.getValue(process.env, 'ENVIRONMENT', 'public')

  app.close = () => {
    const servers = app.servers || []
    const tasks = servers.map((server) => {
      return new Promise((resolve, reject) => {
        server.on('close', (err) => {
          if (err) {
            return reject(err)
          }

          const index = servers.indexOf(server)
          if (index > -1) {
            servers.splice(index, 1)
          }

          resolve()
        })
        server.close()
      })
    })

    return Promise.all(tasks)
  }

  logger.debug('Get configuration')
  logger.ts = Date.now()
  await require('./configuration')(app, opts)
  logger.dt('Configuration loaded')
  app.config.set(opts || {})

  // logger.debug('Apply constants')
  // await require('./constants')(app, opts)
  // logger.dt('Applied constants')
  //
  // logger.debug('Apply services')
  // await require('./services')(app, opts)
  // logger.dt('Applied services')
  //
  // logger.debug('Apply error handlers')
  // await require('./errors')(app, opts)
  // logger.dt('Applied error handlers')
  //
  logger.debug('Apply renderers')
  await require('./renderers')(app, opts)
  logger.dt('Applied renderers')

  // logger.debug('Apply body parsers')
  // await require('./bodyparsers')(app, opts)
  // logger.dt('Applied body parsers')
  //
  // logger.debug('Apply Redis connection')
  // await require('./redis')(app, opts)
  // logger.dt('Applied Redis connection')
  //
  // logger.debug('Apply cache')
  // await require('./cache')(app, opts)
  // logger.dt('Applied cache')
  //
  // logger.debug('Apply static paths')
  // await require('./static')(app, opts)
  // logger.dt('Applied static paths')
  //
  // logger.debug('Apply session storage')
  // await require('./session')(app, opts)
  // logger.dt('Applied session storage')
  //
  // logger.debug('Apply logger')
  // await require('./logger')(app, opts)
  // logger.dt('Applied logger')
  //
  // logger.debug('Apply locales')
  // await require('./locales')(app, opts)
  // logger.dt('Applied locales')
  //
  logger.debug('Apply routes')
  await require('./routes')(app, opts)
  logger.dt('Applied routes')

  return app
}
