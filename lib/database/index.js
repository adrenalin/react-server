/**
 * Database baseclass
 *
 * @author Arttu Manninen <arttu@kaktus.cc>
 */

const errors = require('@vapaaradikaali/errors')
const Interface = require('../interface')

class Database extends Interface {
  static getEngine (app, engine, options = {}) {
    if (engine.match(/[^a-zA-Z0-9]/)) {
      throw new errors.BadRequest('Invalid database engine name')
    }

    try {
      const DatabaseEngine = require(`./${engine}`)
      return new DatabaseEngine(app, options)
    } catch (err) {
      if (err.code === 'MODULE_NOT_FOUND') {
        throw new errors.NotImplemented(`Database engine "${engine}" not implemented`)
      }

      /* istanbul ignore next rethrow error */
      throw err
    }
  }

  /**
   * Database query
   *
   * @abstract
   * @method Database.query
   */
  async query () {
    throw new errors.NotImplemented('Not implemented')
  }

  /**
   * Connect to database
   *
   * @abstract
   * @method Database.connect
   * @param { object } options        Connection options
   */
  async connect (options) {
    throw new errors.NotImplemented('Not implemented')
  }

  /**
   * Execute a cursor
   *
   * @abstract
   * @method Database.cursor
   * @param { object } options        Connection options
   */
  async cursor (options) {
    throw new errors.NotImplemented('Not implemented')
  }
}

module.exports = Database
