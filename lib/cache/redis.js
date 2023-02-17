const errors = require('@vapaaradikaali/errors')
const redis = require('redis')
const Cache = require('./')

// Singleton connection
let client

/**
 * @class RedisCache
 * @implements Cache
 * @param { Server } app            Server application
 */
class RedisCache extends Cache {
  static get LOG_LEVEL () {
    /* istanbul ignore next */
    return 3
  }

  constructor (app) {
    super(app)

    this.storageKey = this.config.get('storageKey', 'cache')
  }

  /**
   * Get prefixed storage key
   *
   * @method RedisCache#getStorageKey
   * @param { string } key            Storage key
   * @return { string }               Prefixed storage key
   */
  getStorageKey (key) {
    return `${this.storageKey}.${key}`
  }

  /**
   * Get the connected Redis client
   *
   * @method RedisCache.getClient
   * @return { RedisClient }          Connected Redis client
   */
  static getClient () {
    if (!client) {
      client = redis.createClient()
    }

    return client
  }

  /**
   * Get the connected Redis client
   *
   * @method RedisCache#getClient
   * @return { RedisClient }          Connected Redis client
   */
  getClient () {
    return RedisCache.getClient()
  }

  /**
   * Connect the Redis client
   *
   * @method RedisCache.connect
   */
  static async connect () {
    const client = RedisCache.getClient()
    try {
      await client.ping()
      return client
    } catch (err) {
      await RedisCache.getClient().connect()
      return client
    }
  }

  /**
   * Connect the cache storage engine
   *
   * @method RedisCache#connect
   */
  async connect () {
    return this.constructor.connect()
  }

  /**
   * Disconnect the Redis client
   *
   * @method RedisCache#disconnect
   */
  static async disconnect () {
    await client.quit()
    client = null
  }

  /**
   * Get value
   *
   * @method RedisCache#get
   * @param { string } key            Storage key
   * @param { mixed } [defaultValue]  Default value
   * @return { mixed }                Stored value or the given default value
   */
  async get (key, defaultValue) {
    try {
      const storageKey = this.getStorageKey(key)
      const serialized = await this.getClient().get(storageKey)

      if (serialized == null) {
        return defaultValue
      }

      const stored = JSON.parse(serialized)

      if (stored.expires && stored.expires <= Date.now() / 1000) {
        return defaultValue
      }

      return stored.value != null ? stored.value : defaultValue
    } catch (err) {
      /* istanbul ignore next */
      this.logger.warn(`Caught an error "${err.message}" when trying to get a cached value for key`, key)
      /* istanbul ignore next */
      this.logger.warn(err.stack)

      return defaultValue
    }
  }

  /**
   * Set value
   *
   * @method RedisCache#set
   * @param { string } key            Storage key
   * @param { mixed } value           Storage value
   * @param { number } expires        Number of seconds the value should be stored
   * @return { Promise }              Resolves with self
   */
  async set (key, value, expires = 0) {
    const expiresIn = this.constructor.getExpiresIn(expires)
    await this.del(key)

    const opts = {}
    const storageValue = {
      value
    }

    if (expiresIn) {
      opts.EX = expiresIn * 1000
      opts.NX = true
      storageValue.expires = Math.floor(Date.now() / 1000 + expiresIn)
    }

    const storageKey = this.getStorageKey(key)

    await this.getClient().set(storageKey, JSON.stringify(storageValue), opts)
  }

  /**
   * Delete a key
   *
   * @method RedisCache#del
   * @param { string } key            Storage key
   * @return { Promise }              Resolves with self
   */
  async del (key) {
    await this.getClient().del(this.getStorageKey(key))
  }

  /**
   * Set an expiration time for the given key
   *
   * @method RedisCache#expire
   * @param { string } key            Storage key
   * @param { number } [expires]      Number of seconds the value should be stored
   */
  async expire (key, expires) {
    const expiresIn = this.constructor.getExpiresIn(expires)
    const stored = await this.get(key)
    await this.set(key, stored, expiresIn)
  }

  /**
   * Flush cache, optionally with a search string
   *
   * @method RedisCache#flush
   * @param { string } [needle]       Needle
   * @return { MemCache }             This instance
   */
  async flush (needle) {
    const client = this.getClient()
    const keys = await client.sendCommand(['KEYS', `${this.getStorageKey('')}*`])
    const regexp = needle ? new RegExp(needle) : null

    for (const key of keys) {
      if (regexp && !key.match(regexp)) {
        continue
      }

      await client.del(key)
    }

    return this
  }
}

module.exports = RedisCache
