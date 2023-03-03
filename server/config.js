const path = require('path')
const Logger = require('@vapaaradikaali/logger')
const ServerConfig = require('@vapaaradikaali/helpers.js/lib/ServerConfig')

module.exports = (app, overrides) => {
  const logger = new Logger('@adrenalin/react-server/server/config')
  logger.setLevel(3)
  logger.debug('Load configuration')

  const defaults = {
    APPLICATION_ROOT: path.join(__dirname, '..')
  }

  app = app || defaults
  overrides = overrides || {}

  const appRoot = overrides.APPLICATION_ROOT || app.APPLICATION_ROOT || defaults.APPLICATION_ROOT

  const config = app.config = new ServerConfig()
  const schema = require(path.join(__dirname, '..', 'schemas', 'config.json'))

  // Load first the defaults
  config
    .loadFile(path.join(__dirname, '..', 'config', 'defaults.yml'))

  // Then set schema which may otherwise override other values
  config.setSchema(schema)

  const env = app.environment || process.env.ENVIRONMENT

  config
    .loadFile(path.join(appRoot, 'config', 'defaults.yml'))
    .loadFile(path.join(appRoot, 'config', `${env}.yml`), true)
    .loadFile(path.join(appRoot, 'config', 'local.yml'), true)
    .loadFile(path.join(appRoot, 'config', `local-${env}.yml`), true)

  logger.log('Configuration loaded')
  logger.debug('Loaded configuration', config.get())

  return app
}
