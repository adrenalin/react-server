const path = require('path')
const expect = require('expect.js')
const { Config } = require('@adrenalin/helpers.js')
const Mailer = require('../../../services/mailer')
const serviceLoader = require('../../../server/services')

describe('services/mailer', () => {
  const createApp = () => {
    const app = require('express')()
    app.APPLICATION_ROOT = path.join(__dirname, '..', '..', '..')
    app.config = new Config()
    app.config.set('services.mailer.enabled', true)
    return app
  }

  it('should bind to the application', async () => {
    const app = createApp()
    await serviceLoader(app)
    expect(app.services).to.have.property('mailer')
    expect(app.services.mailer).to.be.a(Mailer)
  })
})
