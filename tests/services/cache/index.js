const expect = require('expect.js')
const errors = require('@adrenalin/errors')
const { sleep } = require('@adrenalin/helpers.js')
const CacheService = require('../../../services/cache')

describe('services/cache', () => {
  it('should have interface methods "get", "set" and "del"', async () => {
    const testKey = 'tests-services-cache-test-interface-get-set-del'
    const testValue = 'It should have interface methods "get", "set" and "del"'

    const app = await require('../../../server/application')()
    app.config.set('services.cache.engine', 'memcache')

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

      const service = new CacheService(app)
      await service.register()
      service.getClient()
      throw new Error('Should have thrown a NotImplemented')
    } catch (err) {
      expect(err).to.be.a(errors.NotImplemented)
    }
  })

  it('should return Redis client for Redis cache storage engine', async () => {
    const app = await require('../../../server/application')()
    app.config.set('services.cache.engine', 'redis')

    const service = new CacheService(app)
    await service.register()
    service.getClient()
  })

  it('should have interface method "add" to add into an array', async () => {
    const testKey = 'tests-services-cache-add'

    const app = await require('../../../server/application')()
    app.config.set('services.cache.engine', 'memcache')

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

    const service = new CacheService(app)
    await service.register()

    await service.set(testKey, [1, 2, 3])
    await service.remove(testKey, 2)

    const stored = await service.get(testKey)
    expect(stored).to.eql([1, 3])
  })
})
