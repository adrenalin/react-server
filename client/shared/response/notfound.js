import DefaultError from '../errors/defaulterror'

/**
 * HTTP/1.1 404 Not Found page
 *
 * @class Forbidden
 * @param { object } props            Component props
 */
module.exports = class NotFound extends DefaultError {
  /**
   * Status code
   *
   * @const { number } NotFound.STATUS_CODE
   */
  static get STATUS_CODE () {
    return 404
  }
}
