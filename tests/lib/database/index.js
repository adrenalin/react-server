const errors = require('@adrenalin/errors')
const expect = require('expect.js')
const DatabaseBaseclass = require('../../../lib/database')
const { Config } = require('@adrenalin/helpers.js')

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
      expect(err).to.be.a(errors.NotImplemented)
    }
  })

  it('should have the abstract method "connect"', async () => {
    try {
      const db = new DatabaseBaseclass(app)
      expect(db.query).to.be.a('function')
      await db.connect()
      throw new Error('Should have thrown an exception')
    } catch (err) {
      expect(err).to.be.a(errors.NotImplemented)
    }
  })

  it('should have a static method getEngine', (done) => {
    expect(DatabaseBaseclass).to.have.property('getEngine')
    expect(DatabaseBaseclass.getEngine).to.be.a('function')
    done()
  })

  it('should pass the options from the getEngine factory method', async () => {
    const testOptions = {
      connection: {
        host: '127.0.0.1',
        port: 1234,
        database: 'test-getengine-options-passing-database',
        username: 'test-getengine-options-passing-username',
        password: 'test-getengine-options-passing-password'
      }
    }
    const db = DatabaseBaseclass.getEngine(app, 'psql', testOptions)
    expect(db.options.host).to.eql(testOptions.connection.host)
    expect(db.options.port).to.eql(testOptions.connection.port)
    expect(db.options.database).to.eql(testOptions.connection.database)
    expect(db.options.user).to.eql(testOptions.connection.username)
    expect(db.options.password).to.eql(testOptions.connection.password)
  })

  it('should throw an error for an invalid database engine name', (done) => {
    try {
      DatabaseBaseclass.getEngine(app, 'foo bar')
      throw new Error('Should have thrown an exception')
    } catch (err) {
      expect(err).to.be.a(errors.BadRequest)
      done()
    }
  })

  it('should throw an error for an unknown database engine', (done) => {
    try {
      DatabaseBaseclass.getEngine(app, 'foobar')
      throw new Error('Should have thrown an exception')
    } catch (err) {
      expect(err).to.be.a(errors.NotImplemented)
      done()
    }
  })
})
