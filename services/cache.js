const errors = require('@vapaaradikaali/errors')
const { castToArray } = require('@vapaaradikaali/helpers.js')
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
   * Get cache key
   *
   * @method CacheService#getCacheKey
   * @private
   * @param { string } key            Cache key
   * @return { string }               Prefixed cache key
   */
  getCacheKey (key) {
    const prefix = this.config.get('services.cache.prefix')
    return prefix ? `${prefix}.${key}` : key
  }

  /**
   * Register database service
   *
   * @method CacheService#register
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
   * @method CacheService#get
   * @param { string } key            Storage key
   * @param { mixed } defaultValue    Default value
   * @return { mixed }                Stored value
   */
  async get (key, defaultValue) {
    if (this.config.get('services.cache.bypass')) {
      this.logger.warn('services.cache.bypass flag is on, all cache requests will be bypassed')
      return defaultValue
    }

    const cacheKey = this.getCacheKey(key)
    return await this.cache.get(cacheKey, defaultValue)
  }

  /**
   * Set value
   *
   * @method CacheService#set
   * @param { string } key            Storage key
   * @param { mixed } value           Storage value
   * @param { number } expires        Number of seconds the value should be stored
   * @return { CacheService }         Resolves with self
   */
  async set (key, value, expires) {
    const cacheKey = this.getCacheKey(key)
    await this.cache.set(cacheKey, value, expires)
    return this
  }

  /**
   * Delete a key
   *
   * @method CacheService#del
   * @param { string } key            Storage key
   * @return { CacheService }         Resolves with self
   */
  async del (key) {
    const cacheKey = this.getCacheKey(key)
    await this.cache.del(cacheKey)
    return this
  }

  /**
   * Set expiration to a key
   *
   * @method CacheService#expire
   * @param { string } key            Storage key
   * @param { number } expires        Number of seconds the value should be stored
   * @return { CacheService }         Resolves with self
   */
  async expire (key, expires) {
    const cacheKey = this.getCacheKey(key)
    await this.cache.expire(cacheKey, expires)
    return this
  }

  /**
   * Add to a storage key
   *
   * @method CacheService#add
   * @param { string } key            Storage key
   * @param { mixed } values          Values to store
   */
  async add (key, ...values) {
    const cacheKey = this.getCacheKey(key)

    const value = await this.cache.get(cacheKey)
    const stored = castToArray(value)

    values.forEach((v) => {
      stored.push(v)
    })

    await this.cache.set(cacheKey, stored)
    return this
  }

  /**
   * Remove from to a storage key
   *
   * @method CacheService#remove
   * @param { string } key            Storage key
   * @param { mixed } values          Values to store
   */
  async remove (key, ...values) {
    const cacheKey = this.getCacheKey(key)

    const value = await this.cache.get(cacheKey)
    const stored = castToArray(value)

    values.forEach((v) => {
      while (stored.includes(v)) {
        stored.splice(stored.indexOf(v), 1)
      }
    })

    await this.cache.set(cacheKey, stored)
    return this
  }

  /**
   * Get the storage client
   *
   * @method CacheService#getClient
   * @return { mixed }                Storage client
   */
  getClient () {
    if (typeof this.cache.getClient !== 'function') {
      throw new errors.NotImplemented(`Method "getClient" is not defined in cache engine "${this.cache.constructor.name}"`)
    }

    return this.cache.getClient()
  }

  /**
   * Hydrate cache value
   *
   * @method CacheService#hydrate
   * @param { string } key            Cache storage key
   * @param { function } callback       Hydrate callback when there is a cache miss
   * @param { number|string } [expires] Number of seconds or a ISO 8601 string the value should be stored
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

  /**
   * Flush cache, optionally with a search string
   *
   * @method CacheService#flush
   * @param { string } [needle]       Needle
   * @param { number } expires        Number of seconds the value should be stored
   * @return { CacheService }         This instance
   */
  async flush (needle) {
    await this.cache.flush(needle)
    return this
  }
}

module.exports = CacheService
