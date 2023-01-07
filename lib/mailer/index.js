const { Validator } = require('jsonschema')
const errors = require('@vapaaradikaali/errors')
const Interface = require('../interface')
const mailerErrors = require('./errors')
const schema = require('../../schemas/mailer/message')
const validator = new Validator()

class MailerInterface extends Interface {
  static get errors () {
    return mailerErrors
  }

  get errors () {
    return mailerErrors
  }

  /* istanbul ignore next */
  static get LOG_LEVEL () {
    return 3
  }

  /**
   * Static factory method to get the engine
   *
   * @param { express } app           Express application
   * @param { string } type           Engine type
   * @return { MailerInterface }      Mailer interface
   */
  static getEngine (app, type) {
    if (!type.match(/^[a-zA-Z0-9]+$/)) {
      throw new Error('Invalid engine name')
    }

    const Engine = require(`./${type}`)
    const instance = new Engine(app)

    return instance
  }

  /**
   * Send a message
   *
   * @param { object } message        Message
   */
  async send (message) {
    MailerInterface.validateMessage(message)
    return await this._send(message)
  }

  /**
   * Send a message
   *
   * @param { object } message        Message
   */
  async _send (message) {
    throw new errors.NotImplemented('Abstract method _send in MailerInterface has not been implemented')
  }

  /**
   * Validate message before sending
   *
   * @param { object } message        Mailer message
   */
  static validateMessage (message) {
    const result = validator.validate(message, schema)

    if (!result.valid) {
      throw new errors.ValidationError('validationFailed', result.errors)
    }
  }
}

module.exports = MailerInterface
