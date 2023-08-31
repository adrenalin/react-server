const { expect } = require('chai')
const errors = require('@vapaaradikaali/errors')
const { sleep } = require('@vapaaradikaali/helpers.js')
const CacheService = require('../../../services/cache')

describe('services/cache', () => {
  it('should have interface methods "get", "set" and "del"', async () => {
    const testKey = 'tests-services-cache-test-interface-get-set-del'
    const testValue = 'It should have interface methods "get", "set" and "del"'

    const app = await require('../../../server/application')()
    app.config.set('services.cache.engine', 'memcache')
    app.config.set('services.cache.bypass', false)

    const service = new CacheService(app)
    await service.register()

    const beforeSet = await service.get(testKey)
    expect(beforeSet).to.eql(undefined)

    await service.set(testKey, testValue)
    const afterSet = await service.get(testKey)
    expect(afterSet).to.eql(testValue)

    await service.del(testKey)
    const afterDel = await service.get(testKey)
    expect(afterDel).to.eql(undefined)
  })

  it('should have an interface method "expire"', async () => {
    const testKey = 'tests-services-cache-test-interface-expire'
    const testValue = 'It should have interface method "expire"'

    const app = await require('../../../server/application')()
    app.config.set('services.cache.engine', 'memcache')
    app.config.set('services.cache.bypass', false)

    const service = new CacheService(app)
    await service.register()

    const beforeSet = await service.get(testKey)
    expect(beforeSet).to.eql(undefined)

    await service.set(testKey, testValue)
    const afterSet = await service.get(testKey)
    expect(afterSet).to.eql(testValue)

    await service.expire(testKey, 0.001)
    await sleep(0.01)
    const afterExpire = await service.get(testKey)
    expect(afterExpire).to.eql(undefined)
  })

  it('should throw a NotImplemented for getClient for memcache', async () => {
    try {
      const app = await require('../../../server/application')()
      app.config.set('services.cache.engine', 'memcache')
      app.config.set('services.cache.bypass', false)

      const service = new CacheService(app)
      await service.register()
      service.getClient()
      throw new Error('Should have thrown a NotImplemented')
    } catch (err) {
      expect(err).to.be.an.instanceof(errors.NotImplemented)
    }
  })

  it('should return Redis client for Redis cache storage engine', async () => {
    const app = await require('../../../server/application')()
    app.config.set('services.cache.engine', 'redis')
    app.config.set('services.cache.bypass', false)

    const service = new CacheService(app)
    await service.register()
    service.getClient()
  })

  it('should have interface method "add" to add into an array', async () => {
    const testKey = 'tests-services-cache-add'

    const app = await require('../../../server/application')()
    app.config.set('services.cache.engine', 'memcache')
    app.config.set('services.cache.bypass', false)

    const service = new CacheService(app)
    await service.register()

    await service.add(testKey, 1)
    await service.add(testKey, 2)

    const stored = await service.get(testKey)
    expect(stored).to.eql([1, 2])
  })

  it('should have interface method "remove" to remove from an array', async () => {
    const testKey = 'tests-services-cache-add'

    const app = await require('../../../server/application')()
    app.config.set('services.cache.engine', 'memcache')
    app.config.set('services.cache.bypass', false)

    const service = new CacheService(app)
    await service.register()

    await service.set(testKey, [1, 2, 3])
    await service.remove(testKey, 2)

    const stored = await service.get(testKey)
    expect(stored).to.eql([1, 3])
  })

  it('should have interface method "getCacheTimestamp"', async () => {
    const testKey = 'tests-services-cache-add'

    const app = await require('../../../server/application')()
    app.config.set('services.cache.engine', 'memcache')
    app.config.set('services.cache.bypass', false)

    const service = new CacheService(app)
    await service.register()

    await service.set(testKey, [1, 2, 3], 1)

    const cachedAt = await service.getCacheTimestamp(testKey)
    console.log('cachedAt', cachedAt)
    const d = new Date(cachedAt)
    expect(d - Date.now()).to.be.below(1000)
  })

  it('should get hydrated value if it exists', async () => {
    const testKey = 'tests-services-cache-hydrate-exists-key'
    const testValue = 'tests-services-cache-hydrate-exists-value'

    const app = await require('../../../server/application')()
    app.config.set('services.cache.engine', 'memcache')
    app.config.set('services.cache.bypass', false)

    const service = new CacheService(app)
    await service.register()

    await service.set(testKey, testValue, 2)
    const stored = await service.hydrate(testKey, () => null, 10)

    expect(stored).to.equal(testValue)
  })

  it('should use callback to hydrate the key that does not exist', async () => {
    const testKey = 'tests-services-cache-hydrate-callback-key'
    const testValue = 'tests-services-cache-hydrate-callback-value'

    const app = await require('../../../server/application')()
    app.config.set('services.cache.engine', 'memcache')
    app.config.set('services.cache.bypass', false)

    const service = new CacheService(app)
    await service.register()

    const stored = await service.hydrate(testKey, () => testValue, 10)
    const cached = await service.get(testKey)

    expect(stored).to.equal(testValue)
    expect(cached).to.equal(testValue)
  })

  it('should wait for hydration callback to finish when running parallel hydrations', async () => {
    let i = 0
    const testKey = 'tests-services-cache-hydrate-callback-key'
    const testCallback = async () => {
      await sleep(50)
      i++
      return i
    }

    const app = await require('../../../server/application')()
    app.config.set('services.cache.engine', 'memcache')
    app.config.set('services.cache.bypass', false)

    const service = new CacheService(app)
    await service.register()

    service.hydrate(testKey, testCallback)
    const value = await service.hydrate(testKey, testCallback, 10)

    expect(value).to.equal(1)
  })

  it('should bypass cache when configured to bypass', async () => {
    const testKey = 'tests-services-cache-hydrate-bypass-key'
    const testValue = 'tests-services-cache-hydrate-bypass-value'

    const app = await require('../../../server/application')()
    app.config.set('services.cache.engine', 'memcache')
    app.config.set('services.cache.bypass', true)

    const service = new CacheService(app)
    await service.register()

    await service.set(testKey, testValue, 2)

    const stored = await service.get(testKey, 'defaultValue')
    const hydrate = await service.hydrate(testKey, () => 'noHydrate', 10)

    expect(stored).to.equal('defaultValue')
    expect(hydrate).to.equal('noHydrate')
  })

  it('should allow setting cache prefix', async () => {
    const testPrefix = 'test-prefix'
    const testKey = 'tests-services-cache-set-prefix-key'
    const testValue = 'tests-services-cache-set-prefix-value'

    const app = await require('../../../server/application')()
    app.config.set('services.cache.bypass', false)
    app.config.set('services.cache.engine', 'memcache')
    app.config.set('services.cache.prefix', testPrefix)

    const service = new CacheService(app)
    await service.register()

    await service.set(testKey, testValue, 2)

    const afterSet = await service.get(testKey)
    expect(afterSet).to.eql(testValue, 'Test value before prefix change')

    // Reset prefix
    app.config.set('services.cache.prefix', '')

    const afterDifferentPrefix = await service.get(testKey)
    expect(afterDifferentPrefix).to.eql(undefined, 'Test value with different prefix')

    // Return the initial prefix
    app.config.set('services.cache.prefix', testPrefix)
    const afterReset = await service.get(testKey)
    expect(afterReset).to.eql(testValue, 'Test value after resetting the prefix')
  })

  it('should flush cache', async () => {
    const testKey = 'tests-services-cache-flush-all-key'
    const testValue = 'tests-services-cache-flush-all-value'

    const app = await require('../../../server/application')()
    app.config.set('services.cache.bypass', false)
    app.config.set('services.cache.engine', 'memcache')

    const service = new CacheService(app)
    await service.register()

    await service.set(testKey, testValue, 2)

    const pre = await service.get(testKey)
    expect(pre).to.eql(testValue, 'Test value before cache flush')

    await service.flush()

    const post = await service.get(testKey)
    expect(post).to.eql(undefined, 'Test value after cache flush')
  })
})
