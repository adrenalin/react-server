const path = require('path')
const { expect } = require('chai')
const Database = require('../../../lib/database')
const PsqlDatabase = require('../../../lib/database/psql')
const ServerConfig = require('@adrenalin/helpers.js/lib/ServerConfig')

describe('lib/database/psql', () => {
  const app = {
    config: new ServerConfig()
  }

  app.config.loadFile(path.join(__dirname, '..', '..', '..', 'config', 'test.yml'))
  app.config.loadFile(path.join(__dirname, '..', '..', '..', 'config', 'test-local.yml'), true)

  const engine = 'psql'

  it('should return a psql instance with factory method', (done) => {
    const psql = Database.getEngine(app, engine)
    expect(psql).to.be.an.instanceof(PsqlDatabase)
    done()
  })

  it('should be able to connect to psql server', async () => {
    const psql = Database.getEngine(app, engine)
    await psql.connect()
    const result = await psql.query('SELECT NOW()')
    const row = result.rows[0]

    expect(row).to.have.property('now')
  })

  it('should accept explicit definitions for the connection', async () => {
    const testOptions = {
      connection: {
        host: '127.0.0.1',
        port: 1234,
        database: 'test-getengine-options-passing-database',
        username: 'test-getengine-options-passing-username',
        password: 'test-getengine-options-passing-password'
      }
    }
    const db = PsqlDatabase.getEngine(app, 'psql', testOptions)
    const uri = db.getConnectionString(testOptions)

    expect(uri).to.eql(`postgresql://${testOptions.connection.username}:${testOptions.connection.password}@${testOptions.connection.host}:${testOptions.connection.port}/${testOptions.connection.database}`)
  })

  it('should accept uri wrapped in a "connection" object', async () => {
    const testOptions = {
      connection: {
        uri: 'postgresql://username:password@localhost:5432/db?query_string=foobar'
      }
    }
    const db = PsqlDatabase.getEngine(app, 'psql', testOptions)
    const uri = db.getConnectionString(testOptions)

    expect(uri).to.eql(testOptions.connection.uri)
  })

  it('should be able to handle transactions', async () => {
    const psql = Database.getEngine(app, engine)
    await psql.connect()
    const c1 = await psql.connect()
    const c2 = await psql.connect()

    try {
      await c1.query('CREATE TABLE tests_transaction (id INT)')

      await c1.query('BEGIN')
      await c1.query('INSERT INTO tests_transaction (id) VALUES (1)')

      // Test from outside the scope before the transaction has been committed
      const r0 = await c2.query('SELECT id FROM tests_transaction')
      expect(r0.rows.length).to.equal(0)

      // Test from inside the scope before the transaction has been committed
      const r1 = await c1.query('SELECT id FROM tests_transaction')
      expect(r1.rows.length).to.equal(1)

      await c1.query('COMMIT')

      // Test from outside the scope after the transaction has been committed
      const r2 = await c2.query('SELECT id FROM tests_transaction')
      expect(r2.rows.length).to.equal(1)

      // Cleanup
      await c1.query('DROP TABLE tests_transaction')
    } catch (err) {
      // Cleanup
      await c1.query('ROLLBACK')
      await c1.query('DROP TABLE tests_transaction')
    } finally {
      // Release the connections
      c1.release()
      c2.release()
    }
  })
})
