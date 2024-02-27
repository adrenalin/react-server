const Cache = require('./')

/**
 * @class MemCache
 * @implements Cache
 * @param { Server } app            Server application
 */
class MemCache extends Cache {
  constructor (app) {
    super(app)

    this.storage = {}
    this.timer = setInterval(this.autoclean.bind(this), 1000)
    this.usePointers = false
  }

  /**
   * Connect the cache engine
   *
   * @method MemCache#connect
   */
  async connect () {
  }

  /**
   * Clean up the expired values
   *
   * @private
   * @method MemCache#autoclean
   */
  autoclean () {
    Object.keys(this.storage).forEach((key) => {
      if (!this.hasExpired(this.storage[key])) {
        this.logger.debug('Cleaning skipped, still valid', key)
        return
      }

      this.logger.debug('Cleaning as invalid', key)
      this.del(key)
    })
  }

  /**
   * Internal helper function to determine if a storage path has expired
   *
   * @private
   * @method MemCache#hasExpired
   * @param { object } storage        Storage object
   * @return { boolean }              True if the object has expired, otherwise false
   */
  hasExpired (storage) {
    if (storage.expires == null) {
      return false
    }

    return storage.expires <= Date.now() / 1000
  }

  /**
   * Get value
   *
   * @method MemCache#get
   * @param { string } key            Storage key
   * @param { mixed } [defaultValue]  Default value if storage value is not set
   * @return { mixed }                Stored value
   */
  async get (key, defaultValue) {
    const storage = this.storage[key] || {
      value: defaultValue
    }

    if (this.hasExpired(storage)) {
      return defaultValue
    }

    return storage.value
  }

  /**
   * Get timestamp for a cache key
   *
   * @method CacheService#get
   * @param { string } key            Storage key
   * @param { mixed } defaultValue    Default value
   * @return { mixed }                Stored value
   */
  async getCacheTimestamp (key) {
    const storage = this.storage[key] || {}
    return this.hasExpired(storage) ? null : storage.stored || null
  }

  /**
   * Set value
   *
   * @method MemCache#set
   * @param { string } key            Storage key
   * @param { mixed } value           Storage value
   * @param { number } [expires]      Number of seconds the value should be stored
   * @return { MemCache }             This instance
   */
  async set (key, value, expires) {
    const expiresIn = this.constructor.getExpiresIn(expires)
    const storage = {
      value: this.usePointers ? value : JSON.parse(JSON.stringify(value)),
      stored: (new Date()).toISOString(),
      expires: expiresIn == null ? null : Date.now() / 1000 + expiresIn
    }

    this.storage[key] = storage
    return this
  }

  /**
   * Delete a key
   *
   * @method MemCache#del
   * @param { string } key            Storage key
   * @return { MemCache }             This instance
   */
  async del (key) {
    if (this.storage[key]) {
      delete this.storage[key]
    }

    return this
  }

  /**
   * Set an expiration time for the given key
   *
   * @method MemCache#expire
   * @param { string } key            Storage key
   * @param { number } [expires]      Number of seconds the value should be stored
   * @return { MemCache }             This instance
   */
  async expire (key, expires) {
    const expiresIn = this.constructor.getExpiresIn(expires)
    const storage = this.storage[key]
    if (!storage) {
      return
    }

    if (!expiresIn) {
      delete storage.expires
      return this
    }

    storage.expires = Math.floor(Date.now() / 1000 + expiresIn)

    return this
  }

  /**
   * Flush cache, optionally with a search string
   *
   * @method MemCache#flush
   * @param { string } [needle]       Needle
   * @return { MemCache }             This instance
   */
  async flush (needle) {
    const regexp = needle ? new RegExp(needle) : null

    for (const key in this.storage) {
      if (regexp && !key.match(regexp)) {
        continue
      }

      delete this.storage[key]
    }

    return this
  }
}

module.exports = MemCache
