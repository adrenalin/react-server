const { Pool } = require('pg')
const Database = require('./')

class PsqlDatabase extends Database {
  constructor (app, options) {
    super(app, options)
    this.logger.debug('Got options', options)

    const opts = this.options = {
      host: this.helpers.getValue(options, 'connection.host', this.app.config.get('services.database.connection.host')),
      port: this.helpers.getValue(options, 'connection.port', this.app.config.get('services.database.connection.port')),
      database: this.helpers.getValue(options, 'connection.database', this.app.config.get('services.database.connection.database')),
      user: this.helpers.getValue(options, 'connection.username', this.app.config.get('services.database.connection.username')),
      password: this.helpers.getValue(options, 'connection.password', this.app.config.get('services.database.connection.password'))
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
