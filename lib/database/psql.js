const { Pool } = require('pg')
const Database = require('./')
const { buildUrl } = require('@vapaaradikaali/helpers.js')

class PsqlDatabase extends Database {
  constructor (app, options) {
    super(app, options)
    this.logger.debug('Got options', options)
    this.logger.setLevel(4)

    const connectionString = this.getConnectionString(options)
    this.logger.log('Connect using', connectionString)
    this.pool = new Pool({ connectionString })
    this.connection = null
  }

  /**
   * Get connection URI for the connection pool
   *
   * @param { string|object } options   Connection options
   * @return { string }                 Connection URI
   */
  getConnectionString (options = {}) {
    const uri = this.helpers.getValue(options, 'connection.uri')

    if (uri) {
      return uri
    }

    const opts = {
      protocol: this.helpers.getValue(options, 'connection.protocol', this.app.config.get('services.database.connection.protocol', 'postgresql')),
      host: this.helpers.getValue(options, 'connection.host', this.app.config.get('services.database.connection.host', 'localhost')),
      port: this.helpers.getValue(options, 'connection.port', this.app.config.get('services.database.connection.port')),
      location: this.helpers.getValue(options, 'connection.database', this.app.config.get('services.database.connection.database')),
      username: this.helpers.getValue(options, 'connection.username', this.app.config.get('services.database.connection.username')),
      password: this.helpers.getValue(options, 'connection.password', this.app.config.get('services.database.connection.password')),
      query: this.helpers.getValue(options, 'connection.query', this.app.config.get('services.database.connection.query'))
    }

    for (const key in opts) {
      if (!opts[key]) {
        delete opts[key]
      }
    }

    this.logger.debug('Options', opts)
    return buildUrl(opts)
  }

  /**
   * Connect to the Postgres pool
   */
  async connect () {
    this.connection = await this.pool.connect()
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

    return this
  }

  /**
   * Execute a query
   */
  async query (...args) {
    return this.pool.query(...args)
  }
}

module.exports = PsqlDatabase
