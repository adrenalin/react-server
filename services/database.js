const Service = require('./')
const Database = require('../lib/database')

class DatabaseService extends Service {
  static get SERVICE_NAME () {
    return 'database'
  }

  /**
   * Convenience alias for connect
   *
   * @return { function }             Return the connect method of this instance
   */
  get getClient () {
    return this.connect
  }

  constructor (app) {
    super(app)
    this.db = null
    this.connection = null
  }

  /**
   * Register database service
   *
   * @return { DatabaseService }      This instance
   */
  async register (config) {
    this.options = config || {}
    this.connection = await this.connect(config)

    return this
  }

  /**
   * Pass the query to the engine
   *
   * @param { mixed } args            Query arguments
   * @return { mixed }                Pass through the database engine response
   */
  async query (...args) {
    return this.db.query(...args)
  }

  /**
   * Pass the connection to the engine
   *
   * @param { mixed } args            Query arguments
   * @return { mixed }                Pass through the database engine response
   */
  async connect () {
    const engine = this.helpers.getValue(this.options || {}, 'engine') || this.config.get('services.database.engine')
    this.db = this.db || Database.getEngine(this.app, engine, this.options || {})
    this.connection = await this.db.connect()
    return this.connection
  }

  /**
   * Close the connection
   */
  async close () {
    if (this.connection) {
      await this.connection.release()
      this.connection = null
    }

    if (this.connection) {
      await this.db.close()
      this.db = null
    }
  }
}

module.exports = DatabaseService
