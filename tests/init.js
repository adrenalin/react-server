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

after((done) => {
  if (!app || !app.close) {
    setTimeout(() => {
      process.exit()
    }, 100)
    return done()
  }

  app.close()
    .then(() => {
      done()
      setTimeout(() => {
        process.exit()
      }, 100)
    })
    .catch((err) => {
      done(err)

      setTimeout(() => {
        process.exit(1)
      }, 100)
    })
})

module.exports = async () => {
  if (app) {
    return app
  }

  app = await initServer(opts)

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
