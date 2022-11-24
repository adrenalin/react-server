import DefaultError from './defaulterror'

module.exports = class NotFound extends DefaultError {
  static get STATUS_CODE () {
    return 404
  }
}
