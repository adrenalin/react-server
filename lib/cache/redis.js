const errors = require('@adrenalin/errors')
const redis = require('redis')
const Cache = require('./')

// Singleton connection
let client

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
   * @param { string } key            Storage key
   * @return { string }               Prefixed storage key
   */
  getStorageKey (key) {
    return `${this.storageKey}.${key}`
  }

  /**
   * Get the connected Redis client
   *
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
   * @return { RedisClient }          Connected Redis client
   */
  getClient () {
    return RedisCache.getClient()
  }

  /**
   * Connect the Redis client
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
   */
  async connect () {
    return this.constructor.connect()
  }

  /**
   * Disconnect the Redis client
   */
  static async disconnect () {
    await client.quit()
    client = null
  }

  /**
   * Get value
   *
   * @param { string } key            Storage key
   * @param { mixed } [defaultValue]  Default value
   * @return { Promise }              Resolves with the stored value
   */
  async get (key, defaultValue) {
    try {
      const storageKey = this.getStorageKey(key)
      const serialized = await this.getClient().get(storageKey)

      if (serialized == null) {
        return defaultValue
      }

      const stored = JSON.parse(serialized)

      if (stored.expires && stored.expires <= Date.now()) {
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
   * @param { string } key            Storage key
   * @param { mixed } value           Storage value
   * @param { number } expires        Number of seconds the value should be stored
   * @return { Promise }              Resolves with self
   */
  async set (key, value, expires = 0) {
    if (expires > 0 && expires < 0.001) {
      throw new errors.InvalidArgument('Expires has to be at least one millisecond')
    }

    const opts = {}
    const storageValue = {
      value
    }

    if (expires > 0) {
      opts.EX = expires * 1000
      opts.NX = true
      storageValue.expires = Date.now() + expires
    }

    const storageKey = this.getStorageKey(key)

    await this.getClient().set(storageKey, JSON.stringify(storageValue), opts)
  }

  /**
   * Delete a key
   *
   * @param { string } key            Storage key
   * @return { Promise }              Resolves with self
   */
  async del (key) {
    await this.getClient().del(this.getStorageKey(key))
  }

  /**
   * Set an expiration time for the given key
   *
   * @param { string } key            Storage key
   * @param { number } [expires]      Number of seconds the value should be stored
   */
  async expire (key, expires) {
    const stored = await this.get(key)
    await this.del(key)
    await this.set(key, stored, expires)
  }
}

module.exports = RedisCache
