import DefaultError from '../defaulterror'

/**
 * HTTP/1.1 400 Invalid request
 *
 * @class InvalidRequest
 * @param { object } props            Component props
 */
module.exports = class InvalidRequest extends DefaultError {
  /**
   * Status code
   *
   * @const { number } InvalidRequest.STATUS_CODE
   */
  static get STATUS_CODE () {
    return 400
  }
}
