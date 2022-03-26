const path = require('path')
const Logger = require('@adrenalin/logger')
const ServerConfig = require('@adrenalin/helpers.js/lib/ServerConfig')

module.exports = async (app, overrides) => {
  const logger = new Logger('Configuration')
  logger.setLevel(3)
  logger.debug('Load configuration')

  const config = app.config = new ServerConfig()
  const schema = require(path.join(__dirname, '..', 'schemas', 'config.json'))

  config
    .loadFile(path.join(app.APPLICATION_ROOT, 'config', 'defaults.yml'))
    .loadFile(path.join(app.APPLICATION_ROOT, 'config', `${app.environment}.yml`), true)
    .loadFile(path.join(app.APPLICATION_ROOT, 'config', 'local.yml'), true)
    .loadFile(path.join(app.APPLICATION_ROOT, 'config', `local-${app.environment}.yml`), true)

  config.setSchema(schema)

  logger.log('Configuration loaded')
  logger.debug('Loaded configuration', config.get())

  return app
}
