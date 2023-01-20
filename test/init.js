require('@babel/register')
const fs = require('fs')
const path = require('path')
const Moment = require('moment-timezone')
const initServer = require('../server')
const Logger = require('@vapaaradikaali/logger')
const { Localization } = require('@vapaaradikaali/helpers.js')

// Disable noisy localization
Localization.registerLogger(() => {})

// Disable logger
Logger.setMaxLevel(Logger.NONE)

// Suppress MomentJS warnings
Moment.suppressDeprecationWarnings = true

// Force test environment
process.env.ENVIRONMENT = 'test'

const opts = {
  server: {
    port: 3111
  },
  logger: {
    level: 0
  }
}

if (fs.existsSync(path.join(__dirname, '..', 'dist'))) {
  throw new Error('Cannot run tests, "./dist" exists in the project root')
}

let app

module.exports = async (options = {}) => {
  if (app) {
    return app
  }

  app = await initServer({
    ...opts,
    ...options
  })

  return app
}
