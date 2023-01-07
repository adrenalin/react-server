const Logger = require('@vapaaradikaali/logger')
const helpers = require('@vapaaradikaali/helpers.js')

class Interface {
  static get LOG_LEVEL () {
    return 3
  }

  /**
   * Simple constructor
   */
  constructor (app) {
    this.app = app
    this.logger = new Logger(this)
    this.helpers = helpers
    this.logger.setLevel(this.constructor.LOG_LEVEL)
  }
}

module.exports = Interface
