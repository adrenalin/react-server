const { expect } = require('chai')
const init = require('../../init')
const MailerInterface = require('../../../lib/mailer')
const MailerInterfaceSMTP = require('../../../lib/mailer/smtp')
const SMTPTester = require('smtp-tester')

describe('lib/mailer/smtp', () => {
  let app, server, port
  const smtpPort = 4001

  before(async () => {
    app = await init()
    port = app.config.get('services.mailer.smtp.server.port', 4001)

    app.config.set('services.mailer.smtp.server.port', smtpPort)
    server = await SMTPTester.init(smtpPort)
  })

  after(async () => {
    await server.stop()
    app.config.set('services.mailer.smtp.server.port', port)
  })

  it('should create an instance of MailerInterface with the factory method', () => {
    const instance = MailerInterface.getEngine(app, 'smtp')
    expect(instance).to.be.an.instanceof(MailerInterfaceSMTP)
  })

  it('should send a message', async () => {
    const message = {
      to: 'test-should-send-a-message@example.net',
      subject: 'Should send a message',
      text: 'Test'
    }

    const instance = MailerInterface.getEngine(app, 'smtp')
    instance.send(message)
    await server.captureOne(message.to)
  })

  it('should send a message to the cc addresses', async () => {
    const message = {
      to: 'test-should-send-a-message@example.net',
      cc: 'test-should-send-a-message-to-cc@example.net',
      subject: 'Should send a message',
      text: 'Test'
    }

    const instance = MailerInterface.getEngine(app, 'smtp')
    instance.send(message)
    await server.captureOne(message.cc)
  })

  it('should send a message to the bcc addresses', async () => {
    const message = {
      to: 'test-should-send-a-message@example.net',
      bcc: 'test-should-send-a-message-to-bcc@example.net',
      subject: 'Should send a message',
      text: 'Test'
    }

    const instance = MailerInterface.getEngine(app, 'smtp')
    instance.send(message)
    await server.captureOne(message.bcc)
  })

  it('should set message headers', async () => {
    const headers = {
      'in-reply-to': 'foobar@example.net',
      references: [
        'foobar@example.net'
      ]
    }
    const message = {
      to: 'test-should-set-message-headers@example.net',
      subject: 'Should set message headers',
      text: 'Test',
      headers
    }

    const instance = MailerInterface.getEngine(app, 'smtp')
    instance.send(message)
    const { email } = await server.captureOne(message.to)

    expect(email.headers).to.have.property('in-reply-to')
    expect(email.headers['in-reply-to']).to.eql(`<${headers['in-reply-to']}>`)

    expect(email.headers).to.have.property('references')

    for (const v of headers.references) {
      expect(email.headers.references).to.contain(v)
    }
  })
})
