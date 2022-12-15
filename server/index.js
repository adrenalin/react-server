const Logger = require('@adrenalin/logger')
const { castToArray } = require('@adrenalin/helpers.js')

module.exports = async (opts = {}) => {
  const logger = new Logger('@adrenalin/react-server/server/index')
  logger.setLevel(5)
  logger.info('Start initializing the server')

  const app = await require('./application')(opts)
  logger.debug('Start listener on port', app.config.get('server.port'))

  castToArray(app.config.get('server.port'))
    .forEach((port) => {
      const server = app.listen(port)
      app.servers = app.servers || []
      app.servers.push(server)
      logger.info('Listening to port', port)
    })

  return app
}
