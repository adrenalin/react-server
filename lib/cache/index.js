/**
 * Cache baseclass
 *
 * @author Arttu Manninen <arttu@kaktus.cc>
 */

const errors = require('@adrenalin/errors')
const { Config, Localization } = require('@adrenalin/helpers.js')
const Interface = require('../interface')

class Cache extends Interface {
  static getEngine (app, engine) {
    if (engine.match(/[^a-zA-Z0-9]/)) {
      throw new errors.BadRequest('Invalid engine name')
    }

    try {
      const CacheEngine = require(`./${engine}`)
      return new CacheEngine(app, engine)
    } catch (err) {
      throw new errors.NotImplemented(`Engine "${engine}" not implemented`)
    }
  }

  constructor (app) {
    super(app)
    const name = Localization.toCase(this.constructor.name, 'camel')

    this.config = new Config()
    this.config.set(app.config.get(name))
    this.setStorageKey(this.config.get('storageKey') || 'cache')
    this.onInitialize()
  }

  onInitialize () {}

  /**
   * Set storage key to isolate all cache queries to their own context. This
   * is essentially for key-value storages where a level of hygiene might be
   * needed to prevent leaking data.
   *
   * @param { string } key            Storage prefix
   * @return { Cache }                This instance
   */
  setStorageKey (key) {
    this.storageKey = key
    return this
  }

  /**
   * Get storage key
   *
   * @return { string }               Storage key
   */
  getStorageKey (key) {
    return this.storageKey
  }

  /**
   * Get value
   *
   * @param { string } key            Storage key
   * @param { mixed } [defaultValue]  Default value if storage value is not set
   * @return { mixed }                Stored value
   */
  async get (key, defaultValue) {
    throw new errors.NotImplemented('Not implemented')
  }

  /**
   * Set value
   *
   * @param { string } key            Storage key
   * @param { mixed } value           Storage value
   * @param { number } [expires]      Number of seconds the value should be stored
   */
  async set (key, value, expires) {
    throw new errors.NotImplemented('Not implemented')
  }

  /**
   * Delete a key
   *
   * @param { string } key            Storage key
   */
  async del (key) {
    throw new errors.NotImplemented('Not implemented')
  }

  /**
   * Expire a value
   *
   * @param { string } key            Storage key
   * @param { number } expires        Number of seconds the value should be stored
   */
  async expire (key, time) {
    throw new errors.NotImplemented('Not implemented')
  }
}

module.exports = Cache
