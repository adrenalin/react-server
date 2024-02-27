const path = require('path')
const ServerConfig = require('@vapaaradikaali/helpers.js/lib/ServerConfig')
const config = new ServerConfig()

const schema = require(path.join(__dirname, '..', 'schemas', 'config.json'))
const configRoot = path.join(__dirname, '..', 'config')

// Load first the defaults
config
  .loadFile(path.join(configRoot, 'defaults.yml'))

// Then set schema which may otherwise override other values
config.setSchema(schema)

// Load the environment config
const env = process.env.ENVIRONMENT
config
  .loadFile(path.join(configRoot, `${env}.yml`), true)
  .loadFile(path.join(configRoot, 'local.yml'), true)
  .loadFile(path.join(configRoot, `local-${env}.yml`), true)

module.exports = config
