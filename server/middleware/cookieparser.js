const Logger = require('@vapaaradikaali/logger')

module.exports = async (app) => {
  const logger = new Logger('@adrenalin/react-server/server/middleware/cookieparsers')
  logger.setLevel(0)
  logger.info('Initializing body parsers')

  const cookieparser = require('cookie-parser')
  app.use(cookieparser(app.config.get('middleware.cookieparser.secret'), app.config.get('middleware.cookieparser.options', {})))

  return app
}
