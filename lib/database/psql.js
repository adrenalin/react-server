const { Pool } = require('pg')
const Database = require('./')

class PsqlDatabase extends Database {
  constructor (app) {
    super(app)

    const opts = {
      host: this.app.config.get('services.database.connection.host'),
      port: this.app.config.get('services.database.connection.port'),
      database: this.app.config.get('services.database.connection.database'),
      user: this.app.config.get('services.database.connection.username'),
      password: this.app.config.get('services.database.connection.password')
    }

    for (const key in opts) {
      if (!opts[key]) {
        delete opts[key]
      }
    }

    this.logger.debug('Options', opts)
    this.pool = new Pool(opts)
  }

  /**
   * Connect to the Postgres pool
   */
  async connect () {
    return this.pool.connect()
  }

  /**
   * Execute a query
   */
  async query (...args) {
    return this.pool.query(...args)
  }
}

module.exports = PsqlDatabase
