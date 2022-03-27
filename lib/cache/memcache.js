const Cache = require('./')

class MemCache extends Cache {
  constructor (app) {
    super(app)

    this.storage = {}
    this.timer = setInterval(this.autoclean.bind(this), 1000)
  }

  /**
   * Clean up the expired values
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
   * @param { object } storage        Storage object
   * @return { boolean }              True if the object has expired, otherwise false
   */
  hasExpired (storage) {
    if (!storage.expires) {
      return false
    }

    return storage.expires <= Date.now()
  }

  /**
   * Get value
   *
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
   * Set value
   *
   * @param { string } key            Storage key
   * @param { mixed } value           Storage value
   * @param { number } [expires]      Number of seconds the value should be stored
   */
  async set (key, value, expires) {
    const storage = {
      value: JSON.parse(JSON.stringify(value)),
      expires: expires > 0 ? Date.now() + expires * 1000 : null
    }

    this.storage[key] = storage
  }

  /**
   * Delete a key
   *
   * @param { string } key            Storage key
   */
  async del (key) {
    if (this.storage[key]) {
      delete this.storage[key]
    }
  }

  /**
   * Set an expiration time for the given key
   *
   * @param { string } key            Storage key
   * @param { number } [expires]      Number of seconds the value should be stored
   */
  async expire (key, expires) {
    const storage = this.storage[key]
    if (!storage) {
      return
    }

    if (expires == null) {
      delete storage.expires
    }

    if (expires) {
      storage.expires = Date.now() + expires * 1000
    }
  }
}

module.exports = MemCache
