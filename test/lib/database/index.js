const errors = require('@vapaaradikaali/errors')
const { expect } = require('chai')
const DatabaseBaseclass = require('../../../lib/database')
const { Config } = require('@vapaaradikaali/helpers.js')

describe('lib/database', () => {
  const app = {
    config: new Config()
  }

  it('should have the abstract method "query"', async () => {
    try {
      const db = new DatabaseBaseclass(app)
      expect(db.query).to.be.a('function')
      await db.query('foo')
      throw new Error('Should have thrown an exception')
    } catch (err) {
      expect(err).to.be.an.instanceof(errors.NotImplemented)
    }
  })

  it('should have the abstract method "connect"', async () => {
    try {
      const db = new DatabaseBaseclass(app)
      expect(db.query).to.be.a('function')
      await db.connect()
      throw new Error('Should have thrown an exception')
    } catch (err) {
      expect(err).to.be.an.instanceof(errors.NotImplemented)
    }
  })

  it('should have the abstract method "cursor"', async () => {
    try {
      const db = new DatabaseBaseclass(app)
      expect(db.query).to.be.a('function')
      await db.cursor()
      throw new Error('Should have thrown an exception')
    } catch (err) {
      expect(err).to.be.an.instanceof(errors.NotImplemented)
    }
  })

  it('should have a static method getEngine', (done) => {
    expect(DatabaseBaseclass).to.have.property('getEngine')
    expect(DatabaseBaseclass.getEngine).to.be.a('function')
    done()
  })

  it('should throw an error for an invalid database engine name', (done) => {
    try {
      DatabaseBaseclass.getEngine(app, 'foo bar')
      throw new Error('Should have thrown an exception')
    } catch (err) {
      expect(err).to.be.an.instanceof(errors.BadRequest)
      done()
    }
  })

  it('should throw an error for an unknown database engine', (done) => {
    try {
      DatabaseBaseclass.getEngine(app, 'foobar')
      throw new Error('Should have thrown an exception')
    } catch (err) {
      expect(err).to.be.an.instanceof(errors.NotImplemented)
      done()
    }
  })
})
