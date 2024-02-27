const Moment = require('moment')
const errors = require('@vapaaradikaali/errors')
const { expect } = require('chai')
const CacheBaseclass = require('../../../lib/cache')
const { Config } = require('@vapaaradikaali/helpers.js')

describe('lib/cache', () => {
  const app = {
    config: new Config()
  }

  it('should initialize config', () => {
    const cacheKey = 'test.key'
    const cacheValue = 'test-value'
    app.config.set(`cache.${cacheKey}`, cacheValue)

    const cache = new CacheBaseclass(app)
    expect(cache).to.have.property('config')
    expect(cache.config.get(cacheKey)).to.equal(cacheValue)
  })

  it('should have methods setStorageKey and getStorageKey', () => {
    const cache = new CacheBaseclass(app)
    const storageKey = 'storage-key'

    expect(cache.setStorageKey).to.be.a('function')
    expect(cache.getStorageKey).to.be.a('function')

    expect(cache.setStorageKey(storageKey)).to.be.an.instanceof(CacheBaseclass)
    expect(cache.getStorageKey()).to.equal(storageKey)
  })

  it('should have the abstract method "connect"', async () => {
    try {
      const cache = new CacheBaseclass(app)
      expect(cache.connect).to.be.a('function')
      await cache.connect()
      throw new Error('Should have thrown a NotImplemented')
    } catch (err) {
      expect(err).to.be.an.instanceof(errors.NotImplemented)
    }
  })

  it('should have the abstract method "get"', async () => {
    try {
      const cache = new CacheBaseclass(app)
      expect(cache.get).to.be.a('function')
      await cache.get('foo')
      throw new Error('Should have thrown a NotImplemented')
    } catch (err) {
      expect(err).to.be.an.instanceof(errors.NotImplemented)
    }
  })

  it('should have the abstract method "set"', async () => {
    try {
      const cache = new CacheBaseclass(app)
      expect(cache.set).to.be.a('function')
      await cache.set('foo', 'bar')
      throw new Error('Should have thrown a NotImplemented')
    } catch (err) {
      expect(err).to.be.an.instanceof(errors.NotImplemented)
    }
  })

  it('should have the abstract method "del"', async () => {
    try {
      const cache = new CacheBaseclass(app)
      expect(cache.del).to.be.a('function')
      await cache.del('foo')
      throw new Error('Should have thrown a NotImplemented')
    } catch (err) {
      expect(err).to.be.an.instanceof(errors.NotImplemented)
    }
  })

  it('should have the abstract method "expire"', async () => {
    try {
      const cache = new CacheBaseclass(app)
      expect(cache.expire).to.be.a('function')
      await cache.expire('foo', 1)
      throw new Error('Should have thrown a NotImplemented')
    } catch (err) {
      expect(err).to.be.an.instanceof(errors.NotImplemented)
    }
  })

  it('should throw an error for an invalid cache engine name', () => {
    expect(() => CacheBaseclass.getEngine(app, 'foo bar')).to.throw(errors.BadRequest)
  })

  it('should throw a NotImplemented for a not implemented for unknown cache engine', () => {
    expect(() => CacheBaseclass.getEngine(app, 'foobar')).to.throw(errors.NotImplemented)
  })

  it('should throw a NotImplemented for cache flush', async () => {
    try {
      const cache = new CacheBaseclass(app)
      await cache.flush()
      throw new Error('Should have thrown a NotImplemented')
    } catch (err) {
      expect(err).to.be.an.instanceof(errors.NotImplemented)
    }
  })

  it('should return null when given null in getExpiresIn', () => {
    expect(CacheBaseclass.getExpiresIn(null)).to.equal(null)
  })

  it('should accept a time as an ISO 8601 period for getExpiresIn', () => {
    expect(CacheBaseclass.getExpiresIn('P1D')).to.equal(24 * 3600)
    expect(CacheBaseclass.getExpiresIn('PT1M')).to.equal(60)
    expect(CacheBaseclass.getExpiresIn('PT5S')).to.equal(5)
  })

  it('should have the abstract method getCacheTimestamp', async () => {
    try {
      const cache = new CacheBaseclass(app)
      expect(cache.getCacheTimestamp).to.be.a('function')
      await cache.expire('foo', 1)
      throw new Error('Should have thrown a NotImplemented')
    } catch (err) {
      expect(err).to.be.an.instanceof(errors.NotImplemented)
    }
  })

  it('should accept a time as an ISO 8601 timestamp for getExpiresIn', () => {
    const m = new Moment()
    m.add(10, 'seconds')
    expect(CacheBaseclass.getExpiresIn(m.toISOString())).to.eql(10)
  })

  it('should return zero second expiration for a Moment in the past', () => {
    const m = new Moment()
    m.subtract(10, 'seconds')
    expect(CacheBaseclass.getExpiresIn(m.toISOString())).to.eql(0)
  })

  it('should reject an invalid string for getExpiresIn', () => {
    expect(() => CacheBaseclass.getExpiresIn('foo')).to.throw(errors.InvalidArgument)
  })

  it('should accept a time as a Date for getExpiresIn', () => {
    const d = new Date(Date.now() + 10 * 1000)
    expect(CacheBaseclass.getExpiresIn(d)).to.equal(10)
  })

  it('should accept a time as a Moment for getExpiresIn', () => {
    const m = new Moment()
    m.add(10, 'seconds')
    expect(CacheBaseclass.getExpiresIn(m)).to.eql(10)
  })

  it('should accept a time as a number for getExpiresIn', () => {
    expect(CacheBaseclass.getExpiresIn(10)).to.eql(10)
    expect(CacheBaseclass.getExpiresIn(-10)).to.eql(0)
    expect(CacheBaseclass.getExpiresIn(0.001)).to.eql(0.001)
    expect(CacheBaseclass.getExpiresIn(0.0001)).to.eql(0, 'Normalize to milliseconds')
  })
})
