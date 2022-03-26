const Logger = require('@adrenalin/logger')

module.exports = async (app) => {
  /* istanbul ignore if disabled in configuration */
  if (!app.config.get(['bodyparsers.enabled', 'routers.enabled'])) {
    return app
  }

  const logger = new Logger('Logging')
  logger.setLevel(0)
  logger.info('Initializing body parsers')

  // Setup body parsers
  const bodyParser = require('body-parser')
  app.use(bodyParser.json({
    verify: (req, res, buf, encoding) => {
      req.rawBody = buf.toString()
    }
  }))

  app.use(bodyParser.urlencoded({
    verify: (req, res, buf, encoding) => {
      req.rawBody = buf.toString()
    }
  }))

  return app
}
