const Logger = require('@adrenalin/logger')

module.exports = async (opts = {}) => {
  const logger = new Logger('@adrenalin/react-server/server/index')
  logger.setLevel(5)
  logger.info('Start initializing the server')

  const app = await require('./application')(opts)
  logger.debug('Start listener on port', app.config.get('server.port'))
  const server = app.listen(app.config.get('server.port'))
  app.servers = app.servers || []
  app.servers.push(server)
  logger.info('Listening to port', app.config.get('server.port'))

  return app
}
