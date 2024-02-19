const { NotImplemented } = require('@vapaaradikaali/errors')

module.exports = class DatabaseCursor {
  /**
   * Read cursor
   *
   * @method DatabaseCursor#constructor
   * @param { mixed } client          Database client
   * @param { string|object } query   Query
   * @return { mixed }                Cursor data
   */
  constructor (client, query) {
    this.client = client
  }

  /**
   * Read cursor
   *
   * @method DatabaseCursor#read
   * @param { number } count          Number of rows to read
   * @return { mixed }                Cursor data
   */
  async read (count) {
    throw new NotImplemented('Not implemented')
  }

  /**
   * Close cursor
   *
   * @method DatabaseCursor#close
   */
  async close () {
    throw new NotImplemented('Not implemented')
  }
}