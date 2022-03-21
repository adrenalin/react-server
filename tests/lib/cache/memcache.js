const expect = require('expect.js')
const Cache = require('../../../lib/cache')
const MemCache = require('../../../lib/cache/memcache')
const { Config } = require('@adrenalin/helpers.js')

describe('lib/cache/memcache', () => {
  const app = {
    config: new Config()
  }

  const engine = 'memcache'

  it('should return a memcache instance with factory method', (done) => {
    const cache = Cache.getEngine(app, 'memcache')
    clearInterval(cache.timer)

    expect(cache).to.be.a(MemCache)
    done()
  })

  it('should return undefined for a key that has not been set', (done) => {
    const cache = Cache.getEngine(app, engine)
    clearInterval(cache.timer)

    cache.get('undefined')
      .then((value) => {
        expect(value).to.eql(undefined)
        done()
      })
      .catch(done)
  })

  it('should return the given default value for a key that has not been set', (done) => {
    const cache = Cache.getEngine(app, engine)
    clearInterval(cache.timer)

    const defaultValue = 'default-value'

    cache.get('undefined', defaultValue)
      .then((value) => {
        expect(value).to.eql(defaultValue)
        done()
      })
      .catch(done)
  })

  it('should get a set value', (done) => {
    const cache = Cache.getEngine(app, engine)
    clearInterval(cache.timer)

    const testPath = 'set-value'
    const testValue = 'set value'

    cache.set(testPath, testValue)
      .then(() => {
        return cache.get(testPath)
      })
      .then((value) => {
        expect(value).to.eql(testValue)
        done()
      })
      .catch(done)
  })

  it('should not get an expired value', (done) => {
    const cache = Cache.getEngine(app, engine)
    clearInterval(cache.timer)

    const testPath = 'expired-value'
    const testValue = 'expired value'

    cache.set(testPath, testValue, 0.00001)
      .then(() => {
        return new Promise((resolve, reject) => {
          setTimeout(resolve, 1)
        })
      })
      .then(() => {
        return cache.get(testPath)
      })
      .then((value) => {
        expect(value).to.eql(undefined)
        done()
      })
      .catch(done)
  })

  it('should get the given default value for an expired value', (done) => {
    const cache = Cache.getEngine(app, engine)
    clearInterval(cache.timer)

    const testPath = 'expired-default-value'
    const testValue = 'expired defalt value'
    const defaultValue = 'default value'

    cache.set(testPath, testValue, 0.00001)
      .then(() => {
        return new Promise((resolve, reject) => {
          setTimeout(resolve, 1)
        })
      })
      .then(() => {
        return cache.get(testPath, defaultValue)
      })
      .then((value) => {
        expect(value).to.eql(defaultValue)
        done()
      })
      .catch(done)
  })

  it('should get a copy of the stored object to avoid unexpected side effects', (done) => {
    const cache = Cache.getEngine(app, engine)
    clearInterval(cache.timer)

    const testPath = 'object-value'
    const testValue = {
      key: 'object-value'
    }

    cache.set(testPath, testValue)
      .then(() => {
        return cache.get(testPath)
      })
      .then((value) => {
        expect(value).to.eql(testValue)
        expect(value).not.to.be(testValue)
        done()
      })
      .catch(done)
  })

  it('should delete a set value', (done) => {
    const cache = Cache.getEngine(app, engine)
    clearInterval(cache.timer)

    const testPath = 'expired-default-value'
    const testValue = 'expired defalt value'

    cache.set(testPath, testValue)
      .then(() => {
        return cache.del(testPath)
      })
      .then(() => {
        return cache.get(testPath)
      })
      .then((value) => {
        expect(value).to.eql(undefined)
        done()
      })
      .catch(done)
  })

  it('should not throw an error when deleting an inexistant key', (done) => {
    const cache = Cache.getEngine(app, engine)
    clearInterval(cache.timer)

    cache.del('inexistant-path')
      .then((value) => {
        done()
      })
      .catch(done)
  })

  it('should set a new expiration time', (done) => {
    const cache = Cache.getEngine(app, engine)
    clearInterval(cache.timer)
    expect(cache.expire).to.be.a('function')

    const key = 'set-expiration'
    const value = 'expiration-value'

    cache.set(key, value)
      .then(() => {
        cache.expire(key, 0.001)

        return new Promise((resolve, reject) => {
          setTimeout(resolve, 0.001)
        })
      })
      .then(() => {
        return cache.get(key)
      })
      .then((value) => {
        expect(value).to.eql(undefined)
        done()
      })
      .catch(done)
  })

  it('should clean the expired values', (done) => {
    const cache = Cache.getEngine(app, engine)
    clearInterval(cache.timer)

    const expiredPath = 'expired-value'
    const expiredValue = 'expired value'

    const validPath = 'valid-path'
    const validValue = 'valid value'

    Promise
      .all([
        cache.set(expiredPath, expiredValue, 0.00001),
        cache.set(validPath, validValue, 1000)
      ])
      .then(() => {
        return new Promise((resolve, reject) => {
          setTimeout(resolve, 1)
        })
      })
      .then(() => {
        cache.autoclean()
        expect(cache.storage[expiredPath]).to.eql(undefined)
        expect(cache.storage[validPath]).not.to.eql(undefined)
        done()
      })
      .catch(done)
  })

  it('should remove the expiration value with null expiration', (done) => {
    const cache = Cache.getEngine(app, engine)
    clearInterval(cache.timer)

    const expiringPath = 'expiring-value'
    const expiringValue = 'expiring value'

    cache.set(expiringPath, expiringValue, 0.00001)
      .then(() => {
        return cache.expire(expiringPath)
      })
      .then(() => {
        return new Promise((resolve, reject) => {
          setTimeout(resolve, 1)
        })
      })
      .then(() => {
        cache.autoclean()
        expect(cache.storage[expiringPath].value).to.eql(expiringValue)
        expect(cache.storage[expiringPath].expires).to.eql(undefined)
        done()
      })
      .catch(done)
  })
})
