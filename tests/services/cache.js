const expect = require('expect.js')
const errors = require('@adrenalin/errors')
const CacheService = require('../../services/cache')

describe('services/cache', () => {
  it('should have interface methods get, set, del and expire', async () => {
    const testKey = 'tests-services-cache-test-interface'
    const testValue = 'It should have interface methods get, set, del and expire'

    const app = await require('../../server/application')()
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

  it('should throw a NotImplemented for getClient for memcache', async () => {
    try {
      const app = await require('../../server/application')()
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
    const app = await require('../../server/application')()
    app.config.set('services.cache.engine', 'redis')

    const service = new CacheService(app)
    await service.register()
    service.getClient()
  })
})
