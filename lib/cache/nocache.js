const Cache = require('.')

/**
 * @class NoCache
 * @implements Cache
 * @param { Server } app            Server application
 */
class NoCache extends Cache {
  /**
   * Connect the cache engine
   *
   * @method NoCache#connect
   */
  async connect () {
  }

  /**
   * Get value
   *
   * @method NoCache#get
   * @param { string } key            Storage key
   * @param { mixed } [defaultValue]  Default value if storage value is not set
   * @return { mixed }                Stored value
   */
  async get (key, defaultValue) {
    return defaultValue
  }

  /**
   * Get timestamp for a cache key
   *
   * @method NoCache#get
   * @param { string } key            Storage key
   * @param { mixed } defaultValue    Default value
   * @return { mixed }                Stored value
   */
  async getCacheTimestamp (key) {
    return null
  }

  /**
   * Set value
   *
   * @method NoCache#set
   * @param { string } key            Storage key
   * @param { mixed } value           Storage value
   * @param { number } [expires]      Number of seconds the value should be stored
   * @return { NoCache }              This instance
   */
  async set (key, value, expires) {
    return this
  }

  /**
   * Delete a key
   *
   * @method NoCache#del
   * @param { string } key            Storage key
   * @return { NoCache }             This instance
   */
  async del (key) {
    return this
  }

  /**
   * Set an expiration time for the given key
   *
   * @method NoCache#expire
   * @param { string } key            Storage key
   * @param { number } [expires]      Number of seconds the value should be stored
   * @return { NoCache }             This instance
   */
  async expire (key, expires) {
    return this
  }

  /**
   * Flush cache, optionally with a search string
   *
   * @method NoCache#flush
   * @param { string } [needle]       Needle
   * @return { NoCache }             This instance
   */
  async flush (needle) {
    return this
  }
}

module.exports = NoCache
