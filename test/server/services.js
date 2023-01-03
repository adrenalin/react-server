const path = require('path')
const { expect } = require('chai')
const errors = require('@adrenalin/errors')
const { Config } = require('@adrenalin/helpers.js')
const serviceLoader = require('../../server/services')

const Service = require('../../services')
const L10nService = require('../../services/l10n')
const TestService = require('../resources/server/services/test')

describe('server/services', () => {
  const createApp = () => {
    const app = require('express')()
    app.APPLICATION_ROOT = path.join(__dirname, '..', '..')
    app.config = new Config()
    return app
  }

  it('should not load l10n service when enabled flag is off', async () => {
    const app = createApp()
    app.config.set('services.l10n.enabled', false)
    await serviceLoader(app)
    expect(app.services).not.to.have.property('l10n')
  })

  it('should load l10n service when enabled flag is on', async () => {
    const app = createApp()
    app.config.set('services.l10n.enabled', true)
    await serviceLoader(app)
    expect(app.services).to.have.property('l10n')
    expect(app.services.l10n).to.be.an.instanceof(L10nService)
  })

  it('should load services found from application root', async () => {
    const app = createApp()
    app.APPLICATION_ROOT = path.join(__dirname, '..', 'resources', 'server')
    app.config.set('services.test.enabled', true)
    await serviceLoader(app)

    expect(app.services).to.have.property('test')
    expect(app.services.test).to.be.an.instanceof(TestService)
  })

  it('should not fail when application root has no services', async () => {
    const app = createApp()
    app.APPLICATION_ROOT = path.join(__dirname, '..', 'resources', 'server', 'path-not-found')
    await serviceLoader(app)
  })

  it('should register the service name with class name', async () => {
    const serviceName = 'namefromclass'
    const app = createApp()
    app.config.set(`services.${serviceName}.enabled`, true)
    app.APPLICATION_ROOT = path.join(__dirname, '..', 'resources', 'server')
    await serviceLoader(app)
    expect(app.services[serviceName]).to.be.an.instanceof(Service)
  })

  it('should register the service name from SERVICE_NAME class property when available', async () => {
    const serviceName = 'classproperty'
    const app = createApp()
    app.config.set(`services.${serviceName}.enabled`, true)
    app.APPLICATION_ROOT = path.join(__dirname, '..', 'resources', 'server')
    await serviceLoader(app)
    expect(app.services[serviceName]).to.be.an.instanceof(Service)
  })

  it('should register the service name with the configured alias when available', async () => {
    const app = createApp()
    app.APPLICATION_ROOT = path.join(__dirname, '..', 'resources', 'server')
    app.config.set('services.test2.enabled', true)
    app.config.set('services.test2.service', 'test')
    await serviceLoader(app)

    expect(app.services).to.have.property('test2')
    expect(app.services.test2).to.be.an.instanceof(TestService)
  })

  it('should register the service to an alias when available', async () => {
    const app = createApp()
    app.APPLICATION_ROOT = path.join(__dirname, '..', 'resources', 'server')
    app.config.set('services.test.enabled', true)
    app.config.set('services.test.alias', 'test2')
    await serviceLoader(app)

    expect(app.services).to.have.property('test2')
    expect(app.services.test2).to.be.an.instanceof(TestService)
  })

  it('should register an array of services', async () => {
    const app = createApp()
    app.APPLICATION_ROOT = path.join(__dirname, '..', 'resources', 'server')
    app.config.set('services.test', [
      {
        enabled: true
      },
      {
        enabled: true,
        alias: 'test2'
      }
    ])
    await serviceLoader(app)

    expect(app.services).to.have.property('test')
    expect(app.services.test).to.be.an.instanceof(TestService)

    expect(app.services).to.have.property('test2')
    expect(app.services.test2).to.be.an.instanceof(TestService)
  })

  it('should throw an error when a conflicting service is being registered', async () => {
    try {
      const app = createApp()
      app.APPLICATION_ROOT = path.join(__dirname, '..', 'resources', 'server')
      app.config.set('services.test', [
        {
          enabled: true
        },
        {
          enabled: true
        }
      ])
      await serviceLoader(app)
      throw new Error('Should have thrown a Conflict')
    } catch (err) {
      expect(err).to.be.an.instanceof(errors.Conflict)
    }
  })
})
