const { Pool } = require('pg')
const Cursor = require('pg-cursor')
const { buildUrl, isObject } = require('@vapaaradikaali/helpers.js')
const Database = require('./')
const DatabaseCursor = require('./cursor')

/**
 * Postgres cursor implementation
 *
 * @class PsqlCursor
 */
class PsqlCursor extends DatabaseCursor {
  constructor (client, query) {
    super(client, query)
    const args = [query.text || query, query.values].filter(a => a)
    this.cursor = client.query(new Cursor(...args))
  }

  /**
   * Read cursor
   *
   * @method PsqlCursor#read
   * @param { number } count          Number of rows to read
   * @return { mixed }                Cursor data
   */
  async read (count) {
    return this.cursor.read(count)
  }

  /**
   * Close the cursor
   *
   * @method PsqlCursor#close
   */
  async close () {
    await this.cursor.close()
    await this.client.release()
  }
}

/**
 * Postgres database implementation
 *
 * @class PsqlCursor
 */
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
   * @async
   * @method PsqlDatabase#getConnectionString
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
   *
   * @async
   * @method PsqlDatabase#connect
   */
  async connect () {
    this.connection = await this.pool.connect()
    return this.connection
  }

  /**
   * Close the connection
   *
   * @async
   * @method PsqlDatabase#close
   */
  async close () {
    if (this.connection) {
      await this.connection.release()
      this.connection = null
    }

    return this
  }

  /**
   * Convert a query with named parameters to a query with array parameters
   *
   * @static
   * @method PsqlDatabase.getQuery
   * @param { string|object } query
   * @return { string|object }
   */
  static getQuery (query) {
    if (!query.text || !isObject(query.values)) {
      return query
    }

    const values = []
    const keys = Object.keys(query.values)

    const text = query.text.replace(/(\\)?\$([a-zA-Z0-9_]+)/g, (match, escape, param) => {
      if (!keys.includes(param) || escape) {
        return match.replace(/^\\?/, '')
      }

      values.push(query.values[param])
      return `$${values.length}`
    })

    return {
      text,
      values
    }
  }

  /**
   * Execute a query
   *
   * @async
   * @method PsqlDatabase#query
   * @param { string|object } query   SQL query
   */
  async query (query) {
    return this.pool.query(this.constructor.getQuery(query))
  }

  /**
   * Get a cursor
   */
  async cursor (query) {
    const q = this.constructor.getQuery(query)

    const connection = await this.pool.connect()
    const cursor = new PsqlCursor(connection, q)
    return cursor
  }
}

module.exports = PsqlDatabase
