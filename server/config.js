const path = require('path')
const Logger = require('@vapaaradikaali/logger')
const { argparse } = require('@vapaaradikaali/helpers.js')
const config = require('../lib/config')

module.exports = (app, overrides) => {
  const logger = new Logger('@adrenalin/react-server/server/config')
  logger.setLevel(3)
  logger.debug('Load configuration')

  const defaults = {
    APPLICATION_ROOT: path.join(__dirname, '..')
  }

  app = app || defaults
  overrides = overrides || {}

  app.config = config

  const appRoot = overrides.APPLICATION_ROOT || app.APPLICATION_ROOT || defaults.APPLICATION_ROOT

  const env = app.environment || process.env.ENVIRONMENT

  config
    .loadFile(path.join(appRoot, 'config', 'defaults.yml'))
    .loadFile(path.join(appRoot, 'config', `${env}.yml`), true)
    .loadFile(path.join(appRoot, 'config', 'local.yml'), true)
    .loadFile(path.join(appRoot, 'config', `local-${env}.yml`), true)

  const args = argparse(process.argv)
  const configFile = args['config-file'] || process.env.CONFIG_FILE

  if (configFile) {
    config.loadFile(path.join(process.cwd(), configFile))
  }

  logger.log('Configuration loaded')
  logger.debug('Loaded configuration', config.get())

  return app
}
