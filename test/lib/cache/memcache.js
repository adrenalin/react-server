const { expect } = require('chai')
const Cache = require('../../../lib/cache')
const MemCache = require('../../../lib/cache/memcache')
const { sleep, Config } = require('@vapaaradikaali/helpers.js')

describe('lib/cache/memcache', () => {
  const app = {
    config: new Config()
  }

  const engine = 'memcache'

  it('should return a memcache instance with factory method', async () => {
    const cache = Cache.getEngine(app, 'memcache')
    clearInterval(cache.timer)

    expect(cache).to.be.an.instanceof(MemCache)
  })

  it('should return undefined for a key that has not been set', async () => {
    const cache = Cache.getEngine(app, engine)
    clearInterval(cache.timer)

    const value = await cache.get('undefined')
    expect(value).to.eql(undefined)
  })

  it('should return the given default value for a key that has not been set', async () => {
    const cache = Cache.getEngine(app, engine)
    clearInterval(cache.timer)

    const defaultValue = 'default-value'

    const value = await cache.get('undefined', defaultValue)
    expect(value).to.eql(defaultValue)
  })

  it('should get a set value', async () => {
    const cache = Cache.getEngine(app, engine)
    clearInterval(cache.timer)

    const testPath = 'set-value'
    const testValue = 'set value'

    await cache.set(testPath, testValue)
    const value = await cache.get(testPath)
    expect(value).to.eql(testValue)
  })

  it('should not get an expired value', async () => {
    const cache = Cache.getEngine(app, engine)
    clearInterval(cache.timer)

    const testPath = 'expired-value'
    const testValue = 'expired value'

    await cache.set(testPath, testValue, 0.00001)
    await sleep(1)
    const value = await cache.get(testPath)
    expect(value).to.eql(undefined)
  })

  it('should get the given default value for an expired value', async () => {
    const cache = Cache.getEngine(app, engine)
    clearInterval(cache.timer)

    const testPath = 'expired-default-value'
    const testValue = 'expired defalt value'
    const defaultValue = 'default value'

    await cache.set(testPath, testValue, 0.00001)
    await sleep(1)
    const value = await cache.get(testPath, defaultValue)
    expect(value).to.eql(defaultValue)
  })

  it('should get a copy of the stored object to avoid unexpected side effects', async () => {
    const cache = Cache.getEngine(app, engine)
    clearInterval(cache.timer)

    const testPath = 'object-value'
    const testValue = {
      key: 'object-value'
    }

    await cache.set(testPath, testValue)
    const value = await cache.get(testPath)
    expect(value).to.eql(testValue)
    expect(value).not.to.equal(testValue)
  })

  it('should delete a set value', async () => {
    const cache = Cache.getEngine(app, engine)
    clearInterval(cache.timer)

    const testPath = 'expired-default-value'
    const testValue = 'expired defalt value'

    await cache.set(testPath, testValue)
    await cache.del(testPath)
    const value = await cache.get(testPath)
    expect(value).to.eql(undefined)
  })

  it('should not throw an error when deleting an inexistant key', async () => {
    const cache = Cache.getEngine(app, engine)
    clearInterval(cache.timer)

    await cache.del('inexistant-path')
  })

  it('should set a new expiration time', async () => {
    const cache = Cache.getEngine(app, engine)
    clearInterval(cache.timer)
    expect(cache.expire).to.be.a('function')

    const key = 'set-expiration'
    const value = 'expiration-value'

    await cache.set(key, value)
    await cache.expire(key, 0.001)
    await sleep(0.001)
    const v = await cache.get(key)
    expect(v).to.eql(undefined)
  })

  it('should clean the expired values', async () => {
    const cache = Cache.getEngine(app, engine)
    clearInterval(cache.timer)

    const expiredPath = 'expired-value'
    const expiredValue = 'expired value'

    const validPath = 'valid-path'
    const validValue = 'valid value'

    await Promise
      .all([
        cache.set(expiredPath, expiredValue, 0.00001),
        cache.set(validPath, validValue, 1000)
      ])
    await sleep(1)
    await cache.autoclean()
    expect(cache.storage[expiredPath]).to.eql(undefined)
    expect(cache.storage[validPath]).not.to.eql(undefined)
  })

  it('should remove the expiration value with null expiration', async () => {
    const cache = Cache.getEngine(app, engine)
    clearInterval(cache.timer)

    const expiringPath = 'expiring-value'
    const expiringValue = 'expiring value'

    await cache.set(expiringPath, expiringValue, 0.00001)
    await cache.expire(expiringPath)
    await sleep(1)
    await cache.autoclean()
    expect(cache.storage[expiringPath].value).to.eql(expiringValue)
    expect(cache.storage[expiringPath].expires).to.eql(undefined)
  })
})
