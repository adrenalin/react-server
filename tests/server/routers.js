const path = require('path')
const expect = require('expect.js')
const request = require('supertest')
const errors = require('@adrenalin/errors')
const { Config } = require('@adrenalin/helpers.js')
const routerLoader = require('../../server/routers')

describe('server/routers', () => {
  const createApp = () => {
    const app = require('express')()
    app.APPLICATION_ROOT = path.join(__dirname, '..', '..')
    app.config = new Config()
    app.config.set('routers.enabled', true)
    return app
  }

  it('should not load routers when enabled flag is off', async () => {
    const app = createApp()
    app.config.set('routers.enabled', false)
    await routerLoader(app)

    expect(app.routers).to.eql(undefined)
  })

  it('should load the routers when enabled flag is on', async () => {
    const app = createApp()
    app.config.set('routers.enabled', true)
    await routerLoader(app)

    expect(app.routers).to.be.an('array')
  })

  it('should always populate res.locals.data', async () => {
    const testUrl = '/tests/server/routers/res/locals/data'
    const app = createApp()
    await routerLoader(app)

    app.get(testUrl, (req, res, next) => {
      expect(res.locals.data).to.eql({})
      res.send('ok')
    })

    await request(app).get(testUrl).expect(200)
  })

  it('should load the routers from public when environment is not defined', async () => {
    const testUrl = '/tests/server/routers/public/router'
    const app = createApp()
    app.APPLICATION_ROOT = path.join(__dirname, '..', 'resources', 'server')
    await routerLoader(app)
    const response = await request(app).get(testUrl).expect(200)
    expect(response.text).to.eql(testUrl)
  })

  it('should load the routers from the environment when it is defined', async () => {
    const testUrl = '/tests/server/routers/environment/router'
    const app = createApp()
    app.APPLICATION_ROOT = path.join(__dirname, '..', 'resources', 'server')
    app.environment = 'environment'
    await routerLoader(app)
    const response = await request(app).get(testUrl).expect(200)
    expect(response.text).to.eql(testUrl)
  })

  it('should convert a function router to an object', async () => {
    const testUrl = '/tests/server/routers/no-registerRouter/router'
    const app = createApp()
    app.APPLICATION_ROOT = path.join(__dirname, '..', 'resources', 'server')
    app.environment = 'no-registerRouter'
    await routerLoader(app)
    const response = await request(app).get(testUrl).expect(200)
    expect(response.text).to.eql(testUrl)
  })

  it('should throw an InternalServerError when require fails', async () => {
    try {
      const app = createApp()
      app.APPLICATION_ROOT = path.join(__dirname, '..', 'resources', 'server')
      app.environment = 'throw-error'
      await routerLoader(app)
      throw new Error('Should have thrown an InternalServerError')
    } catch (err) {
      expect(err).to.be.a(errors.InternalServerError)
    }
  })

  it('should throw an InternalServerError when listing routers fails', async () => {
    try {
      const app = createApp()
      app.APPLICATION_ROOT = path.join(__dirname, '..', 'resources', 'server')
      app.environment = 'is-file'
      await routerLoader(app)
      throw new Error('Should have thrown an InternalServerError')
    } catch (err) {
      expect(err).to.be.a(errors.InternalServerError)
    }
  })

  it('should throw an InternalServerError when loading routers fails', async () => {
    try {
      const app = createApp()
      app.APPLICATION_ROOT = path.join(__dirname, '..', 'resources', 'server')
      app.environment = 'throws-error'
      await routerLoader(app)
      throw new Error('Should have thrown an InternalServerError')
    } catch (err) {
      expect(err).to.be.a(errors.InternalServerError)
    }
  })

  it('should load the routers by priority', async () => {
    const testUrl = '/tests/server/routers/priorities/router'
    const app = createApp()
    app.APPLICATION_ROOT = path.join(__dirname, '..', 'resources', 'server')
    app.environment = 'priorities'
    await routerLoader(app)
    const response = await request(app).get(testUrl).expect(200)
    expect(response.text).to.eql('router2')
  })
})
