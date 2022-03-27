const MailerInterface = require('./')
const nodemailer = require('nodemailer')

class MailerInterfaceSMTP extends MailerInterface {
  /**
   * Get SMTP transporter
   *
   * @param { string } sender         Sender email address
   * @return
   */
  getTransporter (sender) {
    const localConfig = this.app.config.get(`services.mailer.smtp.accounts.${sender}`) || {}

    const config = {
      ...this.app.config.get('services.mailer.smtp.server'),
      ...localConfig
    }
    return nodemailer.createTransport(config)
  }

  /**
   * Send an email message
   *
   * @param { object } options        Message options
   */
  async _send (options) {
    const message = {
      from: options.from || this.app.config.get('services.mailer.sender'),
      ...options
    }

    const transporter = this.getTransporter(message.from)
    const info = await transporter.sendMail(message)

    return info.messageId
  }
}

module.exports = MailerInterfaceSMTP
