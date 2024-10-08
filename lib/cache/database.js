const errors = require('@vapaaradikaali/errors')
const Cache = require('./')
const Moment = require('moment')

// Singleton connection
let client

/**
 * @class DatabaseCache
 * @implements Cache
 * @param { Server } app            Server application
 */
class DatabaseCache extends Cache {
  static get LOG_LEVEL () {
    /* istanbul ignore next */
    return 3
  }

  constructor (app, db) {
    super(app)

    this.storageKey = this.config.get('storageKey', 'cache')
    this.source = `"${this.getSource()}"`
    this.db = db || app.services.db

    // Auto cleanup
    /* istanbul ignore next */
    setInterval(() => {
      this.cleanup()
    }, 60 * 1000)
  }

  /**
   * Connect the cache engine
   *
   * @method DatabaseCache#connect
   */
  async connect () {
    await this.db.connect()
  }

  getSource () {
    return [
      this.app.config.get('services.cache.schema'),
      this.app.config.get('services.cache.table', 'cache')
    ]
      .filter(v => v)
      .join('"."')
  }

  /**
   * Get value
   *
   * @method DatabaseCache#get
   * @param { string } key            Storage key
   * @param { mixed } [defaultValue]  Default value if storage value is not set
   * @return { mixed }                Stored value
   */
  async get (key, defaultValue) {
    const query = {
      text: `
        SELECT
          value
        FROM
          ${this.source}
        WHERE
          path = $1 AND
          (expires_at IS NULL OR expires_at >= $2)
      `,
      values: [
        key,
        new Date()
      ]
    }

    const result = await this.db.query(query)
    return result.rows[0] ? result.rows[0].value : defaultValue
  }

  /**
   * Set value
   *
   * @method DatabaseCache#set
   * @param { string } key            Storage key
   * @param { mixed } value           Storage value
   * @param { number } [expires]      Number of seconds the value should be stored
   */
  async set (key, value, expires) {
    const expiresAt = expires ? new Moment().add(expires, 'seconds').toISOString() : null

    const query = {
      text: `
        INSERT INTO
          ${this.source} (path, expires_at, value)
        VALUES
          ($1, $2, $3::JSON)
        ON CONFLICT (path) DO UPDATE SET
          expires_at = EXCLUDED.expires_at,
          value = EXCLUDED.value
      `,
      values: [
        key,
        expiresAt,
        JSON.stringify(value)
      ]
    }

    await this.db.query(query)
  }

  /**
   * Get timestamp for a cache key
   *
   * @method DatabaseCache#get
   * @param { string } key            Storage key
   * @param { mixed } defaultValue    Default value
   * @return { mixed }                Stored value
   */
  async getCacheTimestamp (key) {
    const query = {
      text: `
        SELECT
          expires_at
        FROM
          ${this.source}
        WHERE
          path = $1 AND
          (expires_at IS NULL OR expires_at >= $2)
      `,
      values: [
        key,
        new Date()
      ]
    }

    const result = await this.db.query(query)

    return result.rows[0] && result.rows[0].expires_at > new Date()
      ? result.rows[0].expires_at.toISOString()
      : null
  }

  /**
   * Delete a key
   *
   * @method DatabaseCache#del
   * @param { string } key            Storage key
   * @return { Promise }              Resolves with self
   */
  async del (key) {
    const query = {
      text: `
        DELETE FROM
          ${this.source}
        WHERE
          path = $1
      `,
      values: [
        key
      ]
    }

    await this.db.query(query)
  }

  /**
   * Set an expiration time for the given key
   *
   * @method DatabaseCache#expire
   * @param { string } key            Storage key
   * @param { number } [expires]      Number of seconds the value should be stored
   * @return { MemCache }             This instance
   */
  async expire (key, expires) {
    const expiresIn = Math.floor(this.constructor.getExpiresIn(expires))

    await this.db.query({
      text: `
        UPDATE
          ${this.source}
        SET
          expires_at = NOW() + INTERVAL '${expiresIn} seconds'
        WHERE
          path = $1
      `,
      values: [key]
    })
  }

  /**
   * Flush cache, optionally with a search string
   *
   * @method DatabaseCache#flush
   * @param { string } [needle]       Needle
   * @return { MemCache }             This instance
   */
  async flush (needle) {
    if (!needle) {
      await this.db.query({
        text: `
          DELETE FROM
            ${this.source}
        `
      })
      return
    }

    await this.db.query({
      text: `
        DELETE FROM
          ${this.source}
        WHERE
          path LIKE $1
      `,
      values: [`${needle}%`]
    })
  }

  /**
   * Clean the expired cache keys
   *
   * @method DatabaseCache#cleanup
   */
  async cleanup () {
    await this.db.query({
      text: `
        DELETE FROM
          ${this.source}
        WHERE
          expires_at <= NOW()
      `
    })
  }
}

module.exports = DatabaseCache
