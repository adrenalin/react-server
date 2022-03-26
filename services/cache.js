const errors = require('@adrenalin/errors')
const Service = require('./')
const Cache = require('../lib/cache')

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
    return await this.cache.get(key, defaultValue)
  }

  /**
   * Set value
   *
   * @param { string } key            Storage key
   * @param { mixed } value           Storage value
   * @param { number } expires        Number of seconds the value should be stored
   * @return { Promise }              Resolves with self
   */
  async set (key, value, expires) {
    return await this.cache.set(key, value, expires)
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
}

module.exports = CacheService
