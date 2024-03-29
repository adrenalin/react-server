const path = require('path')
const { expect } = require('chai')
const { Config } = require('@vapaaradikaali/helpers.js')
const SMTPTester = require('smtp-tester')
const Mailer = require('../../../services/mailer')
const serviceLoader = require('../../../server/services')

describe('services/mailer', () => {
  const port = 4002
  const server = SMTPTester.init(port)

  after(async () => {
    await server.stop()
  })

  const createApp = () => {
    const app = require('express')()
    app.APPLICATION_ROOT = path.join(__dirname, '..', '..', '..')
    app.config = new Config()
    app.config.set('services.mailer.enabled', true)
    app.config.set('services.mailer.smtp.server', {
      host: 'localhost',
      port
    })

    return app
  }

  it('should bind to the application', async () => {
    const app = createApp()
    await serviceLoader(app)
    expect(app.services).to.have.property('mailer')
    expect(app.services.mailer).to.be.an.instanceof(Mailer)
  })

  it('should send a message', (done) => {
    const message = {
      to: 'test-services-mailer-should-send-a-message@example.net',
      subject: 'Should send a message',
      text: 'services.mailer should send a message'
    }

    const callback = (addr, id, email) => {
      expect(email.body).to.eql(message.text)
      server.unbind(message.to, callback)
      done()
    }
    server.bind(message.to, callback)

    const app = createApp()
    serviceLoader(app)
      .then(() => {
        app.services.mailer.send(message)
      })
  })

  it('should queue a message', (done) => {
    const message = {
      to: 'test-services-mailer-should-queue-a-message@example.net',
      subject: 'Should queue a message',
      text: 'services.mailer should queue a message'
    }

    const callback = (addr, id, email) => {
      expect(email.body).to.eql(message.text)
      server.unbind(message.to, callback)
      done()
    }
    server.bind(message.to, callback)

    const app = createApp()
    serviceLoader(app)
      .then(() => {
        app.services.mailer.queue(message)
      })
  })
})
