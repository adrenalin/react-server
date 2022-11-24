import DefaultError from './defaulterror'

module.exports = class InvalidRequest extends DefaultError {
  static get STATUS_CODE () {
    return 400
  }
}
