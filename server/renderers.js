const path = require('path')
const Logger = require('@adrenalin/logger')

module.exports = (app) => {
  const logger = new Logger('Renderers')
  logger.log('Initializing renderers')

  if (!app.config.get('routers.enabled')) {
    logger.info('Routers not enabled in the configuration')
    return app
  }

  // Setup ES6 template engine for HTML
  const renderer = require('express-es6-template-engine')
  const viewsPath = path.join(app.APPLICATION_ROOT, 'views')
  app.set('view engine', 'html')
  app.set('views', viewsPath)
  app.engine('html', renderer)

  return Promise.resolve(app)
}
