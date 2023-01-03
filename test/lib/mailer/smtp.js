const expect = require('expect.js')
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

  it('should create an instance of MailerInterface with the factory method', (done) => {
    const instance = MailerInterface.getEngine(app, 'smtp')
    expect(instance).to.be.a(MailerInterfaceSMTP)
    done()
  })

  it('should send a message', (done) => {
    const message = {
      to: 'test-should-send-a-message@example.net',
      subject: 'Should send a message',
      text: 'Test'
    }

    const callback = (addr, id, email) => {
      server.unbind(message.to, callback)
      done()
    }

    server.bind(message.to, callback)

    const instance = MailerInterface.getEngine(app, 'smtp')
    instance.send(message)
  })

  it('should send a message to the cc addresses', (done) => {
    const message = {
      to: 'test-should-send-a-message@example.net',
      cc: 'test-should-send-a-message-to-cc@example.net',
      subject: 'Should send a message',
      text: 'Test'
    }

    const callback = (addr, id, email) => {
      server.unbind(message.cc, callback)
      done()
    }

    server.bind(message.cc, callback)

    const instance = MailerInterface.getEngine(app, 'smtp')
    instance.send(message)
  })

  it('should send a message to the cc addresses', (done) => {
    const message = {
      to: 'test-should-send-a-message@example.net',
      bcc: 'test-should-send-a-message-to-bcc@example.net',
      subject: 'Should send a message',
      text: 'Test'
    }

    const callback = (addr, id, email) => {
      server.unbind(message.bcc, callback)
      done()
    }

    server.bind(message.bcc, callback)

    const instance = MailerInterface.getEngine(app, 'smtp')
    instance.send(message)
  })
})
