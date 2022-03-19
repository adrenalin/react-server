import DefaultError from './defaulterror'

module.exports = class NotFound extends DefaultError {
  static STATUS_CODE = 404
}
