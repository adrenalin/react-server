const path = require('path')
const EventEmitter = require('events')
const Logger = require('@vapaaradikaali/logger')
const helpers = require('@vapaaradikaali/helpers.js')
const applyHook = require('../lib/helpers/applyHook')

const getValue = helpers.getValue

module.exports = async (opts = {}) => {
  const options = opts || {}

  const logger = new Logger('@adrenalin/react-server/server/application')
  logger.setLevel(5)
  logger.info('Start initializing application')

  const app = require('express')()
  app.APPLICATION_ROOT = getValue(options, 'applicationRoot', path.join(__dirname, '..'))

  await applyHook(app, 'onInitializing')

  app.disable('x-powered-by')
  app.environment = process.env.ENVIRONMENT || 'public'
  app.helpers = helpers

  app.IS_DEVELOPMENT = ['dev', 'development'].includes(process.env.NODE_ENV)
  app.CLIENT_ROOT = path.join(app.APPLICATION_ROOT, 'build', 'client', helpers.Localization.toCase(app.environment, 'title'))
  app.STATIC_ROOT = path.join(app.APPLICATION_ROOT, 'build', 'static')
  app.events = new EventEmitter()

  app.environment = helpers.getValue(process.env, 'ENVIRONMENT', 'public')

  app.close = () => {
    const servers = helpers.castToArray(app.servers)

    const tasks = servers.map((server) => {
      return new Promise((resolve, reject) => {
        server.on('close', (err) => {
          /* istanbul ignore if error redundancy */
          if (err) {
            logger.error('Failed to close a server', err.message)
            logger.log(err.stack)

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

  logger.debug('Get config')
  logger.ts = Date.now()
  await applyHook(app, 'onConfiguring')
  await require('./config')(app, opts)
  await applyHook(app, 'onConfigured')
  logger.dt('Config loaded')
  app.config.set(opts || {})

  logger.debug('Apply services')
  await applyHook(app, 'onServicesLoad')
  await require('./services')(app, opts)
  await applyHook(app, 'onServicesLoaded')
  logger.dt('Applied services')

  logger.debug('Apply middleware')
  await applyHook(app, 'onMiddlewareLoad')
  await require('./middleware')(app, opts)
  await applyHook(app, 'onMiddlewareLoaded')
  logger.dt('Applied middleware')

  logger.debug('Apply session')
  await applyHook(app, 'onSessionLoad')
  await require('./session')(app, opts)
  await applyHook(app, 'onSessionLoaded')
  logger.dt('Applied session')

  logger.debug('Apply routers')
  await applyHook(app, 'onRoutersLoad')
  await require('./routers')(app, opts)
  await applyHook(app, 'onRoutersLoaded')
  logger.dt('Applied routers')

  await applyHook(app, 'onInitialized')
  return app
}
