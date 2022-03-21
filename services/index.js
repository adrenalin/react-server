const Logger = require('@adrenalin/logger')

class Service {
  static get LOG_LEVEL () {
    return 3
  }

  static get DEPENDENCIES () {
    return null
  }

  constructor (app) {
    this.app = app
    this.helpers = app.helpers
    this.logger = new Logger(this)

    // Local configuration for the service
    this.config = new app.helpers.Config()
    this.config.set(app.config.get(this.constructor.SERVICE_NAME || this.constructor.name.toLowerCase()))

    this.logger.setLevel(this.constructor.LOG_LEVEL)
  }

  /**
   * Register service
   */
  async register () {}
}

module.exports = Service
