require('@babel/register')
const Moment = require('moment-timezone')
const PersistentConnection = require('./PersistentConnection')
const initServer = require('../server')
const Logger = require('@adrenalin/logger')
const { Localization } = require('@adrenalin/helpers.js')

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

let app

module.exports = async (options = {}) => {
  if (app) {
    return app
  }

  app = await initServer({
    ...opts,
    ...options
  })

  app.tests = {
    requests: {
      basic: new PersistentConnection(app),
      create: () => {
        return new PersistentConnection(app)
      }
    }
  }

  return app
}
