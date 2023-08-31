const { expect } = require('chai')
const errors = require('@vapaaradikaali/errors')
const { Config, sleep } = require('@vapaaradikaali/helpers.js')
const Cache = require('../../../lib/cache')
const RedisCache = require('../../../lib/cache/redis')
class TestError extends Error {}

describe('lib/cache/redis', () => {
  const app = {
    config: new Config()
  }

  const engine = 'redis'

  before(async () => {
    const client = await RedisCache.getClient()
    await client.connect()
  })

  after(async () => {
    await RedisCache.disconnect()
  })

  it('should return a Redis cache instance with factory method', () => {
    const cache = Cache.getEngine(app, engine)
    expect(cache).to.be.an.instanceof(RedisCache)
  })

  it('should connect with the static method', async () => {
    await RedisCache.disconnect()
    await RedisCache.connect()
  })

  it('should connect with the instance connect shorthand', async () => {
    const cache = Cache.getEngine(app, engine)
    await cache.connect()
  })

  it('should return undefined for a key that has not been set', async () => {
    const cache = Cache.getEngine(app, engine)

    const value = await cache.get('undefined')
    expect(value).to.eql(undefined)
  })

  it('should return the given default value for a key that has not been set', async () => {
    const cache = Cache.getEngine(app, engine)
    const defaultValue = 'default-value'

    const value = await cache.get('undefined', defaultValue)
    expect(value).to.eql(defaultValue)
  })

  it('should get a set value', async () => {
    const cache = Cache.getEngine(app, engine)

    const testPath = 'set-value'
    const testValue = 'set value'

    await cache.set(testPath, testValue)
    const value = await cache.get(testPath)
    expect(value).to.eql(testValue)
  })

  it('should not get an expired value', async () => {
    const cache = Cache.getEngine(app, engine)

    const testPath = 'expired-value'
    const testValue = 'expired value'

    await cache.set(testPath, testValue, 0.001)
    await sleep(2)
    const value = await cache.get(testPath)
    expect(value).to.eql(undefined)
  })

  it('should get the given default value for an expired value', async () => {
    const cache = Cache.getEngine(app, engine)

    const testPath = 'expired-value'
    const testValue = 'expired value'
    const defaultValue = 'default value'

    await cache.set(testPath, testValue, 0.001)
    await sleep(1)
    const value = await cache.get(testPath, defaultValue)
    expect(value).to.eql(defaultValue)
  })

  it('should get cache timestamp', async () => {
    const cache = Cache.getEngine(app, engine)
    const testPath = 'expired-default-value'
    const testValue = 'expired defalt value'
    const defaultValue = 'default value'

    await cache.set(testPath, testValue, 1)
    const cachedAt = await cache.getCacheTimestamp(testPath)

    const d = new Date(cachedAt)
    expect(d - Date.now()).to.be.below(1000)
  })

  it('should get null cache timestamp for cache misses', async () => {
    const cache = Cache.getEngine(app, engine)
    const testPath = 'expired-default-value'
    const testValue = 'expired defalt value'
    const defaultValue = 'default value'

    await cache.set(testPath, testValue, -0)
    const cachedAt = await cache.getCacheTimestamp(testPath)
    expect(cachedAt).to.eql(null)
  })

  it('should get a copy of the stored object to avoid unexpected side effects', async () => {
    const cache = Cache.getEngine(app, engine)

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

    const testPath = 'deleted-value'
    const testValue = 'deleted value'

    await cache.set(testPath, testValue)
    await cache.del(testPath)
    const value = await cache.get(testPath)
    expect(value).to.eql(undefined)
  })

  it('should set a new expiration time', async () => {
    const cache = Cache.getEngine(app, engine)
    expect(cache.expire).to.be.a('function')

    const key = 'manually-set-expiration'
    const testValue = 'manual expiration value'

    await cache.set(key, testValue)
    await cache.expire(key, 0.001)
    await sleep(0.01)
    const value = await cache.get(key)
    expect(value).to.eql(undefined)
  })

  it('should not throw an error when deleting an inexistant key', async () => {
    const cache = Cache.getEngine(app, engine)
    await cache.del('inexistant-path')
  })

  it('should throw an error for the internal callRedis function without extra arguments', async () => {
    try {
      const cache = Cache.getEngine(app, engine)
      await cache.callRedis('GET')
      throw new TestError('Should have rejected the promise')
    } catch (err) {
      expect(err).not.to.be.an.instanceof(TestError)
    }
  })

  it('should flush the cache', async () => {
    const testKey = 'cache-flush-all'
    const testValue = 'cache-flush-all-value'

    const cache = Cache.getEngine(app, engine)
    await cache.set(testKey, testValue)

    const pre = await cache.get(testKey)
    expect(pre).to.equal(testValue)

    await cache.flush()

    const post = await cache.get(testKey)
    expect(post).to.equal(undefined)
  })

  it('should use a needle to flush parts of cache', async () => {
    const cache = Cache.getEngine(app, engine)
    await cache.set('test-key-1-1', 'test-value-1-1')
    await cache.set('test-key-1-2', 'test-value-1-1')
    await cache.set('test-key-2-1', 'test-value-2-1')

    await cache.flush('test-key-1')

    const v11 = await cache.get('test-key-1-1')
    const v12 = await cache.get('test-key-1-2')
    const v21 = await cache.get('test-key-2-1')

    expect(v11).to.equal(undefined)
    expect(v12).to.equal(undefined)
    expect(v21).to.equal('test-value-2-1')
  })
})
