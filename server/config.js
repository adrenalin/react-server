const path = require('path')
const Logger = require('@adrenalin/logger')
const ServerConfig = require('@adrenalin/helpers.js/lib/ServerConfig')

module.exports = (app, overrides) => {
  const logger = new Logger('@adrenalin/react-server/server/config')
  logger.setLevel(3)
  logger.debug('Load configuration')

  const defaults = {
    APPLICATION_ROOT: path.join(__dirname, '..')
  }

  app = app || defaults
  const appRoot = overrides.APPLICATION_ROOT || app.APPLICATION_ROOT || defaults.APPLICATION_ROOT

  const config = app.config = new ServerConfig()
  const schema = require(path.join(__dirname, '..', 'schemas', 'config.json'))

  // Load first the defaults
  config
    .loadFile(path.join(__dirname, '..', 'config', 'defaults.yml'))

  // Then set schema which may otherwise override other values
  config.setSchema(schema)

  config
    .loadFile(path.join(appRoot, 'config', 'defaults.yml'))
    .loadFile(path.join(appRoot, 'config', `${app.environment}.yml`), true)
    .loadFile(path.join(appRoot, 'config', 'local.yml'), true)
    .loadFile(path.join(appRoot, 'config', `local-${app.environment}.yml`), true)

  logger.log('Configuration loaded')
  logger.debug('Loaded configuration', config.get())

  return app
}
