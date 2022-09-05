const errors = require('@adrenalin/errors')
const expect = require('expect.js')
const DatabaseBaseclass = require('../../../lib/database')
const { Config } = require('@adrenalin/helpers.js')

describe('lib/cache', () => {
  const app = {
    config: new Config()
  }

  it('should have the abstract method "query"', (done) => {
    const db = new DatabaseBaseclass(app)
    expect(db.query).to.be.a('function')

    db.query('foo')
      .then(() => {
        done(new Error('Should have thrown an exception'))
      })
      .catch((err) => {
        expect(err).to.be.a(errors.NotImplemented)
        done()
      })
  })

  it('should have the abstract method "connect"', (done) => {
    const db = new DatabaseBaseclass(app)
    expect(db.connect).to.be.a('function')

    db.connect('foo')
      .then(() => {
        done(new Error('Should have thrown an exception'))
      })
      .catch((err) => {
        expect(err).to.be.a(errors.NotImplemented)
        done()
      })
  })

  it('should have a static method getEngine', (done) => {
    expect(DatabaseBaseclass).to.have.property('getEngine')
    expect(DatabaseBaseclass.getEngine).to.be.a('function')
    done()
  })

  it('should throw an error for an invalid database engine name', (done) => {
    expect(DatabaseBaseclass.getEngine).withArgs(app, 'foo bar').to.throwError()
    done()
  })
})
