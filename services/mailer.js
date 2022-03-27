const Service = require('./')
const MailerInterface = require('../lib/mailer')

module.exports = class MailerService extends Service {
  static get LOG_LEVEL () {
    return 5
  }

  static get SERVICE_NAME () {
    return 'mailer'
  }

  /**
   * Register mailer service
   *
   * @return { MailerService }        This instance
   */
  async register () {
    this.engine = MailerInterface.getEngine(this.app, this.app.config.get('services.mailer.engine', 'smtp'))
    return this
  }

  /**
   * Send a message
   *
   * @param { object } message        Object complying schema /messages/mail
   */
  async send (message) {
    return await this.engine.send(message)
  }
}
