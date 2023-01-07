const Logger = require('@vapaaradikaali/logger')

module.exports = class Service {
  static get LOG_LEVEL () {
    return 3
  }

  static get DEPENDENCIES () {
    return []
  }

  constructor (app) {
    this.app = app
    this.helpers = app.helpers
    this.logger = new Logger(this)
    this.config = app.config

    this.logger.setLevel(this.constructor.LOG_LEVEL)
  }

  /**
   * Register service
   */
  async register () {}
}
