const errors = require('@adrenalin/errors')
const { castToArray } = require('@adrenalin/helpers.js')
const Service = require('./')
const Cache = require('../lib/cache')

/**
 * Cache service, this will act as an interface between the cache engine and
 * application
 *
 * @class CacheService
 */
class CacheService extends Service {
  static get SERVICE_NAME () {
    return 'cache'
  }

  /**
   * Register database service
   *
   * @return { CacheService }         This instance
   */
  async register () {
    this.cache = Cache.getEngine(this.app, this.config.get('services.cache.engine', 'memcache'))
    this.cache.setStorageKey(this.config.get('storageKey') || 'cache')
    this.cache.connect()

    this.watchers = {}

    return this
  }

  /**
   * Get value
   *
   * @param { string } key            Storage key
   * @param { mixed } defaultValue    Default value
   * @return { mixed }                Stored value
   */
  async get (key, defaultValue) {
    if (this.config.get('services.cache.bypass')) {
      return defaultValue
    }

    return await this.cache.get(key, defaultValue)
  }

  /**
   * Set value
   *
   * @param { string } key            Storage key
   * @param { mixed } value           Storage value
   * @param { number } expires        Number of seconds the value should be stored
   * @return { CacheService }         Resolves with self
   */
  async set (key, value, expires) {
    await this.cache.set(key, value, expires)
    return this
  }

  /**
   * Delete a key
   *
   * @param { string } key            Storage key
   */
  async del (key) {
    return await this.cache.del(key)
  }

  /**
   * Set expiration to a key
   *
   * @param { string } key            Storage key
   * @param { number } expires        Number of seconds the value should be stored
   * @return { CacheService }         Resolves with self
   */
  async expire (key, expires) {
    await this.cache.expire(key, expires)
    return this
  }

  /**
   * Add to a storage key
   *
   * @param { string } key            Storage key
   * @param { mixed } values          Values to store
   */
  async add (key, ...values) {
    const value = await this.cache.get(key)
    const stored = castToArray(value)

    values.forEach((v) => {
      stored.push(v)
    })

    await this.cache.set(key, stored)
    return this
  }

  /**
   * Remove from to a storage key
   *
   * @param { string } key            Storage key
   * @param { mixed } values          Values to store
   */
  async remove (key, ...values) {
    const value = await this.cache.get(key)
    const stored = castToArray(value)

    values.forEach((v) => {
      while (stored.includes(v)) {
        stored.splice(stored.indexOf(v), 1)
      }
    })

    await this.cache.set(key, stored)
    return this
  }

  /**
   * Get the storage client
   *
   * @return { mixed }                Storage client
   */
  getClient () {
    if (typeof this.cache.getClient !== 'function') {
      throw new errors.NotImplemented(`Method "getEngine" is not defined in cache engine "${this.cache.constructor.name}"`)
    }

    return this.cache.getClient()
  }

  /**
   * Hydrate cache value
   *
   * @method CacheService#hydrate
   * @param { string } key            Cache storage key
   * @param { function } callback     Hydrate callback when there is a cache miss
   * @param { number } [expires]      Number of seconds the value should be stored
   * @return { mixed }                Whatever the callback returns
   */
  async hydrate (key, callback, expires = null) {
    const cached = await this.get(key)

    if (cached) {
      return cached
    }

    if (this.watchers[key]) {
      return new Promise((resolve, reject) => {
        this.watchers[key].push({ resolve, reject })
      })
    }

    const watchers = this.watchers[key] = []

    try {
      const hydrated = await callback()
      this.set(key, hydrated, expires)

      // Resolve each promise with the value
      watchers.forEach((watcher) => {
        watcher.resolve(hydrated)
      })

      return hydrated
    } catch (err) {
      // Throw error to each watcher
      watchers.forEach((watcher) => {
        watcher.reject(err)
      })

      throw err
    } finally {
      // Clean watchers
      delete this.watchers[key]
    }
  }
}

module.exports = CacheService
