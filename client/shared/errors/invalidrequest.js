import DefaultError from './defaulterror'

module.exports = class InvalidRequest extends DefaultError {
  static STATUS_CODE = 400
}
