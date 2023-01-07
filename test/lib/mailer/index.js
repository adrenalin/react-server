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

  it('should provide errors as a static attribute', (done) => {
    expect(MailerInterface).to.have.property('errors')

    for (const err in mailerErrors) {
      expect(MailerInterface.errors).to.have.property(err)
      expect(MailerInterface.errors[err]).to.equal(mailerErrors[err])
    }

    done()
  })

  it('should provide errors as an instance attribute', (done) => {
    const app = {}
    const instance = new MailerInterface(app)
    expect(instance).to.have.property('errors')

    for (const err in mailerErrors) {
      expect(instance.errors).to.have.property(err)
      expect(instance.errors[err]).to.equal(mailerErrors[err])
    }

    done()
  })

  it('should have an abstract method "send"', (done) => {
    const app = {}
    const instance = new MailerInterface(app)
    expect(instance.send).to.be.a('function')
    done()
  })

  it('should have a static factory method "getEngine"', (done) => {
    expect(MailerInterface.getEngine).to.be.a('function')
    done()
  })

  it('should create an instance with the getEngine method', (done) => {
    const app = {}
    const instance = MailerInterface.getEngine(app, 'index')
    expect(instance).to.be.an.instanceof(MailerInterface)
    done()
  })

  it('should require an alphabetical engine name', (done) => {
    const app = {}
    expect(() => MailerInterface.getEngine(app, '../calendar')).to.throw()
    done()
  })

  it('should get the engine interface class with getEngine', (done) => {
    const app = {}
    const instance = MailerInterface.getEngine(app, 'index')
    expect(instance).to.be.an.instanceof(MailerInterface)
    done()
  })

  it('should require "to" for a message', (done) => {
    try {
      const message = {
        subject: 'Test message',
        text: 'Test'
      }
      MailerInterface.validateMessage(message)
      throw new Error('Should have thrown an error')
    } catch (err) {
      expect(err).to.be.an.instanceof(errors.ValidationError)
      done()
    }
  })

  it('should require "subject" for a message', (done) => {
    try {
      const message = {
        to: 'test@example.net',
        text: 'Test'
      }
      MailerInterface.validateMessage(message)
      throw new Error('Should have thrown an error')
    } catch (err) {
      expect(err).to.be.an.instanceof(errors.ValidationError)
      done()
    }
  })

  it('should require "text" or "html" for a message', (done) => {
    try {
      const message = {
        to: 'test@example.net',
        subject: 'Test message'
      }
      MailerInterface.validateMessage(message)
      throw new Error('Should have thrown an error')
    } catch (err) {
      expect(err).to.be.an.instanceof(errors.ValidationError)
      done()
    }
  })

  it('should accept "to" as a string', (done) => {
    const message = {
      to: 'test@example.net',
      subject: 'Test',
      text: 'Test'
    }
    MailerInterface.validateMessage(message)
    done()
  })

  it('should reject faulty email address', (done) => {
    try {
      const message = {
        to: 'test',
        subject: 'foo',
        text: 'Test'
      }
      MailerInterface.validateMessage(message)
      throw new Error('Should have thrown an error')
    } catch (err) {
      expect(err).to.be.an.instanceof(errors.ValidationError)
      done()
    }
  })

  it('should accept "to" as an array', (done) => {
    const message = {
      to: ['test@example.net'],
      subject: 'Test',
      text: 'Test'
    }
    MailerInterface.validateMessage(message)
    done()
  })

  it('should reject faulty email address in an array', (done) => {
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
      throw new Error('Should have thrown an error')
    } catch (err) {
      expect(err).to.be.an.instanceof(errors.ValidationError)
      done()
    }
  })
})
