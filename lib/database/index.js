/**
 * Database baseclass
 *
 * @author Arttu Manninen <arttu@kaktus.cc>
 */

const errors = require('@adrenalin/errors')
const Interface = require('../interface')

class Database extends Interface {
  static getEngine (app, engine) {
    if (engine.match(/[^a-zA-Z0-9]/)) {
      throw new errors.BadRequest('Invalid database engine name')
    }

    try {
      const DatabaseEngine = require(`./${engine}`)
      return new DatabaseEngine(app, engine)
    } catch (err) {
      throw new errors.NotImplemented(`Database engine "${engine}" not implemented`)
    }
  }

  /**
   * Database query
   *
   * @abstract
   */
  async query () {
    throw new errors.NotImplemented('Not implemented')
  }

  /**
   * Connect to database
   *
   * @abstract
   */
  async connect () {
    throw new errors.NotImplemented('Not implemented')
  }
}

module.exports = Database
