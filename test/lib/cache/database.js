const { expect } = require('chai')
const errors = require('@vapaaradikaali/errors')
const { sleep } = require('@vapaaradikaali/helpers.js')
const Cache = require('../../../lib/cache')
const DatabaseCache = require('../../../lib/cache/database')
const DatabaseService = require('../../../services/database')
class TestError extends Error {}
const config = require('../../../lib/config')

describe('lib/cache/database', () => {
  const app = {
    config,
    services: {}
  }
  const tmpTable = 'tmp_test_lib_cache_database'
  const cacheSchema = config.get('services.cache.schema')
  const cacheTable = config.get('services.cache.table')

  app.services.db = new DatabaseService(app)

  before(async () => {
    config.set('services.cache.schema', 'public')
    config.set('services.cache.table', tmpTable)

    await app.services.db.register()
    await app.services.db.query({
      text: `
        CREATE TEMPORARY TABLE ${tmpTable} (
          path TEXT PRIMARY KEY,
          created_at TIMESTAMP DEFAULT NOW(),
          expires_at TIMESTAMP,
          value JSONB
        )
      `
    })
  })

  after(async () => {
    config.set('services.cache.schema', cacheSchema)
    config.set('services.cache.table', cacheTable)
  })

  const engine = 'database'

  it('should return a database cache instance with factory method', () => {
    const cache = Cache.getEngine(app, engine)
    expect(cache).to.be.an.instanceof(DatabaseCache)
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
