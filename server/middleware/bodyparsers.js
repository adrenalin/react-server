const Logger = require('@adrenalin/logger')

module.exports = async (app) => {
  const logger = new Logger('@adrenalin/react-server/server/middleware/bodyparsers')
  logger.setLevel(0)
  logger.info('Initializing body parsers')

  const bodyParser = require('body-parser')
  const configured = app.config.get('middleware.bodyparsers')

  for (const key in configured) {
    const config = configured[key] || {}

    if (!config.enabled) {
      continue
    }

    if (config.rawBody) {
      delete config.rawBody
      config.verify = (req, res, buf, encoding) => {
        req.rawBody = buf.toString()
      }
    }

    app.use(bodyParser[key](config))
  }

  return app
}
