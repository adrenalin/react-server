const { expect } = require('chai')
const Cache = require('../../../lib/cache')
const NoCache = require('../../../lib/cache/nocache')
const { sleep, Config } = require('@vapaaradikaali/helpers.js')

describe('lib/cache/no', () => {
  const app = {
    config: new Config()
  }

  const engine = 'nocache'

  it('should return a nocache instance with factory method', async () => {
    const cache = Cache.getEngine(app, engine)
    expect(cache).to.be.an.instanceof(NoCache)
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

  it('should not get a set value', async () => {
    const cache = Cache.getEngine(app, engine)
    const testPath = 'set-value'
    const testValue = ['set value']

    await cache.set(testPath, testValue)
    const value = await cache.get(testPath)
    expect(value).to.eql(undefined)
  })

  it('should have a method del', async () => {
    const cache = Cache.getEngine(app, engine)
    const testPath = 'set-value'
    const value = await cache.del(testPath)
    expect(value).to.equal(cache)
  })

  it('should have a method expire', async () => {
    const cache = Cache.getEngine(app, engine)
    const testPath = 'set-value'
    const value = await cache.expire(testPath)
    expect(value).to.equal(cache)
  })

  it('should have a method flush', async () => {
    const cache = Cache.getEngine(app, engine)
    const testPath = 'set-value'
    const value = await cache.flush(testPath)
    expect(value).to.equal(cache)
  })
})