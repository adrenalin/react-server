const errors = require('@vapaaradikaali/errors')
const { expect } = require('chai')
const CacheBaseclass = require('../../../lib/cache')
const { Config } = require('@vapaaradikaali/helpers.js')

describe('lib/cache', () => {
  const app = {
    config: new Config()
  }

  it('should initialize config', (done) => {
    const cacheKey = 'test.key'
    const cacheValue = 'test-value'
    app.config.set(`cache.${cacheKey}`, cacheValue)

    const cache = new CacheBaseclass(app)
    expect(cache).to.have.property('config')
    expect(cache.config.get(cacheKey)).to.equal(cacheValue)

    done()
  })

  it('should have methods setStorageKey and getStorageKey', (done) => {
    const cache = new CacheBaseclass(app)
    const storageKey = 'storage-key'

    expect(cache.setStorageKey).to.be.a('function')
    expect(cache.getStorageKey).to.be.a('function')

    expect(cache.setStorageKey(storageKey)).to.be.an.instanceof(CacheBaseclass)
    expect(cache.getStorageKey()).to.equal(storageKey)

    done()
  })

  it('should have the abstract method "get"', (done) => {
    const cache = new CacheBaseclass(app)
    expect(cache.get).to.be.a('function')

    cache.get('foo')
      .then(() => {
        done(new Error('Should have thrown an exception'))
      })
      .catch((err) => {
        expect(err).to.be.an.instanceof(errors.NotImplemented)
        done()
      })
  })

  it('should have the abstract method "set"', (done) => {
    const cache = new CacheBaseclass(app)
    expect(cache.set).to.be.a('function')

    cache.set('foo', 'bar')
      .then(() => {
        done(new Error('Should have thrown an exception'))
      })
      .catch((err) => {
        expect(err).to.be.an.instanceof(errors.NotImplemented)
        done()
      })
  })

  it('should have the abstract method "del"', (done) => {
    const cache = new CacheBaseclass(app)
    expect(cache.del).to.be.a('function')

    cache.del('foo')
      .then(() => {
        done(new Error('Should have thrown an exception'))
      })
      .catch((err) => {
        expect(err).to.be.an.instanceof(errors.NotImplemented)
        done()
      })
  })

  it('should have the abstract method "expire"', (done) => {
    const cache = new CacheBaseclass(app)
    expect(cache.expire).to.be.a('function')

    cache.expire('foo', 1)
      .then(() => {
        done(new Error('Should have thrown an exception'))
      })
      .catch((err) => {
        expect(err).to.be.an.instanceof(errors.NotImplemented)
        done()
      })
  })

  it('should throw an error for an invalid cache engine name', (done) => {
    try {
      CacheBaseclass.getEngine(app, 'foo bar')
      throw new Error('Should have thrown an exception')
    } catch (err) {
      expect(err).to.be.an.instanceof(errors.BadRequest)
      done()
    }
  })

  it('should throw an error for a not implemented for unknown cache engine', (done) => {
    try {
      CacheBaseclass.getEngine(app, 'foobar')
      throw new Error('Should have thrown an exception')
    } catch (err) {
      expect(err).to.be.an.instanceof(errors.NotImplemented)
      done()
    }
  })

  it('should throw a NotImplemented error for an inexistant cache engine name', (done) => {
    expect(() => CacheBaseclass.getEngine(app, 'foobar')).to.throw(errors.NotImplemented)
    done()
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
})
