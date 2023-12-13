const { expect } = require('chai')
const errors = require('@vapaaradikaali/errors')
const MailerInterface = require('../../../lib/mailer')
const mailerErrors = require('../../../lib/mailer/errors')

describe('lib/mailer', () => {
  it('should throw a NotImplemented when trying to send with the interface class', async () => {
    try {
      const app = {}
      const instance = new MailerInterface(app)
      await instance._send()
      throw new Error('Should have thrown a NotImplemented')
    } catch (err) {
      expect(err).to.be.an.instanceof(errors.NotImplemented)
    }
  })

  it('should provide errors as a static attribute', () => {
    expect(MailerInterface).to.have.property('errors')

    for (const err in mailerErrors) {
      expect(MailerInterface.errors).to.have.property(err)
      expect(MailerInterface.errors[err]).to.equal(mailerErrors[err])
    }
  })

  it('should provide errors as an instance attribute', () => {
    const app = {}
    const instance = new MailerInterface(app)
    expect(instance).to.have.property('errors')

    for (const err in mailerErrors) {
      expect(instance.errors).to.have.property(err)
      expect(instance.errors[err]).to.equal(mailerErrors[err])
    }
  })

  it('should have an abstract method "send"', () => {
    const app = {}
    const instance = new MailerInterface(app)
    expect(instance.send).to.be.a('function')
  })

  it('should have a static factory method "getEngine"', () => {
    expect(MailerInterface.getEngine).to.be.a('function')
  })

  it('should create an instance with the getEngine method', () => {
    const app = {}
    const instance = MailerInterface.getEngine(app, 'index')
    expect(instance).to.be.an.instanceof(MailerInterface)
  })

  it('should require an alphabetical engine name', () => {
    const app = {}
    expect(() => MailerInterface.getEngine(app, '../calendar')).to.throw()
  })

  it('should get the engine interface class with getEngine', () => {
    const app = {}
    const instance = MailerInterface.getEngine(app, 'index')
    expect(instance).to.be.an.instanceof(MailerInterface)
  })

  it('should require "to" for a message', () => {
    try {
      const message = {
        subject: 'Test message',
        text: 'Test'
      }
      MailerInterface.validateMessage(message)
      throw new Error('Should have thrown a ValidationError')
    } catch (err) {
      expect(err).to.be.an.instanceof(errors.ValidationError)
    }
  })

  it('should require "subject" for a message', () => {
    try {
      const message = {
        to: 'test@example.net',
        text: 'Test'
      }
      MailerInterface.validateMessage(message)
      throw new Error('Should have thrown a ValidationError')
    } catch (err) {
      expect(err).to.be.an.instanceof(errors.ValidationError)
    }
  })

  it('should require "text" or "html" for a message', () => {
    try {
      const message = {
        to: 'test@example.net',
        subject: 'Test message'
      }
      MailerInterface.validateMessage(message)
      throw new Error('Should have thrown a ValidationError')
    } catch (err) {
      expect(err).to.be.an.instanceof(errors.ValidationError)
    }
  })

  it('should require accept only "text" or "html" for a message', () => {
    MailerInterface.validateMessage({
      to: 'test@example.net',
      subject: 'Test message',
      text: 'foo'
    })

    MailerInterface.validateMessage({
      to: 'test@example.net',
      subject: 'Test message',
      html: '<p>foo</p>'
    })
  })

  it('should require accept both "text" and "html" for a message', () => {
    const message = {
      to: 'test@example.net',
      subject: 'Test message',
      text: 'foo',
      html: '<p>foo</p>'
    }
    MailerInterface.validateMessage(message)
  })

  it('should accept "to" as a string', () => {
    const message = {
      to: 'test@example.net',
      subject: 'Test',
      text: 'Test'
    }
    MailerInterface.validateMessage(message)
  })

  it('should reject faulty email address', () => {
    try {
      const message = {
        to: 'test',
        subject: 'foo',
        text: 'Test'
      }
      MailerInterface.validateMessage(message)
      throw new Error('Should have thrown a ValidationError')
    } catch (err) {
      expect(err).to.be.an.instanceof(errors.ValidationError)
    }
  })

  it('should accept "to" as an array', () => {
    const message = {
      to: ['test@example.net'],
      subject: 'Test',
      text: 'Test'
    }
    MailerInterface.validateMessage(message)
  })

  it('should reject faulty email address in an array', () => {
    try {
      const message = {
        to: [
          'test',
          'test@example.net'
        ],
        subject: 'foo',
        text: 'Test'
      }
      MailerInterface.validateMessage(message)
      throw new Error('Should have thrown a ValidationError')
    } catch (err) {
      expect(err).to.be.an.instanceof(errors.ValidationError)
    }
  })
})
