/**
 * Cache baseclass
 *
 * @author Arttu Manninen <arttu@kaktus.cc>
 * @class Cache
 * @param { Server } app            Server application
 * @implements Interface
 */

const Moment = require('moment')
const errors = require('@vapaaradikaali/errors')
const { Config, Localization, parseTemporal } = require('@vapaaradikaali/helpers.js')
const Interface = require('../interface')

class Cache extends Interface {
  /**
   * @method Cache.getEngine
   * @param { Server } app            Server application
   * @return  { CacheEngine }         Cache engine
   */
  static getEngine (app, engine) {
    if (engine.match(/[^a-zA-Z0-9]/)) {
      throw new errors.BadRequest('Invalid cache engine name')
    }

    try {
      const CacheEngine = require(`./${engine}`)
      return new CacheEngine(app, engine)
    } catch (err) {
      throw new errors.NotImplemented(`Cache engine "${engine}" not implemented`)
    }
  }

  /**
   * Get expires in
   *
   * @method Cache.getExpiresIn
   * @param { mixed } expires         Expiration time as an ISO 8601 period or timestamp, a Date, a Moment or a positive number
   * @return { number }               Seconds to expiration
   */
  static getExpiresIn (expires) {
    if (expires == null) {
      return null
    }

    if (typeof expires === 'number') {
      return Math.max(Math.round(expires * 1000) / 1000, 0)
    }

    const now = new Moment()

    if (typeof expires === 'string') {
      if (expires.match(/^P/)) {
        const m = parseTemporal(expires)
        return Math.round(m.diff(now) / 1000)
      }
    }

    const m = new Moment(expires)

    if (!m.isValid()) {
      throw new errors.InvalidArgument(`Could not get Moment for "${expires}"`)
    }

    return Math.round(Math.max(m.diff(now) / 1000, 0))
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
   * Connect the cache engine
   *
   * @abstract
   * @method Cache#connect
   */
  async connect () {
    throw new errors.NotImplemented(`${this.constructor.name}#connect is an abstract method`)
  }

  /**
   * Set storage key to isolate all cache queries to their own context. This
   * is essentially for key-value storages where a level of hygiene might be
   * needed to prevent leaking data.
   *
   * @method Cache#setStorageKey
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
   * @method Cache#getStorageKey
   * @return { string }               Storage key
   */
  getStorageKey (key) {
    return this.storageKey
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
    throw new errors.NotImplemented('Not implemented')
  }

  /**
   * Get value
   *
   * @method Cache#get
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
   * @method Cache#set
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
   * @method Cache#del
   * @param { string } key            Storage key
   */
  async del (key) {
    throw new errors.NotImplemented('Not implemented')
  }

  /**
   * Expire a value
   *
   * @method Cache#expire
   * @param { string } key            Storage key
   * @param { number } expires        Number of seconds the value should be stored
   */
  async expire (key, time) {
    throw new errors.NotImplemented('Not implemented')
  }

  /**
   * Flush cache, optionally with a search string
   *
   * @method Cache#flush
   * @param { string } [needle]       Needle
   * @return { Cache }                This instance
   */
  async flush (needle) {
    throw new errors.NotImplemented('Not implemented')
  }
}

module.exports = Cache
