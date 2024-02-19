const path = require('path')
const { expect } = require('chai')
const Database = require('../../../lib/database')
const PsqlDatabase = require('../../../lib/database/psql')
const ServerConfig = require('@vapaaradikaali/helpers.js/lib/ServerConfig')

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

  it('should be able to close a connection', async () => {
    const psql = Database.getEngine(app, engine)
    await psql.connect()
    expect(psql.connection).not.to.equal(null)

    await psql.close()
    expect(psql.connection).to.equal(null)
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
      throw err
    } finally {
      // Release the connections
      c1.release()
      c2.release()
    }
  })

  it('should keep plain text in PsqlDatabase.getQuery unchanged', () => {
    const query = 'SELECT true'
    expect(PsqlDatabase.getQuery(query)).to.equal(query)
  })

  it('should keep values as array in PsqlDatabase.getQuery unchanged', () => {
    const query = {
      text: 'SELECT foo FROM bar WHERE foo = $1',
      values: ['foo']
    }

    expect(PsqlDatabase.getQuery(query)).to.equal(query)
  })

  it('should convert an object in PsqlDatabase.getQuery with named parameters', () => {
    const params = {
      label: 'this-is-a-label',
      name: 'this-is-a-name',
      foo: 'bar'
    }

    const { text, values } = PsqlDatabase.getQuery({
      text: 'SELECT foo FROM bar WHERE name = $name OR name = $label',
      values: params
    })

    expect(text).to.equal('SELECT foo FROM bar WHERE name = $1 OR name = $2')
    expect(values).to.eql([params.name, params.label])
  })

  it('should ignore missing named parameters', () => {
    const params = {
      label: 'this-is-a-label',
      foo: 'bar'
    }

    const { text, values } = PsqlDatabase.getQuery({
      text: 'SELECT foo FROM bar WHERE name = $name OR name = $label',
      values: params
    })

    expect(text).to.equal('SELECT foo FROM bar WHERE name = $name OR name = $1')
    expect(values).to.eql([params.label])
  })

  it('should ignore escaped named parameters', () => {
    const params = {
      label: 'this-is-a-label',
      name: 'this-is-a-name',
      foo: 'bar'
    }

    const { text, values } = PsqlDatabase.getQuery({
      text: 'SELECT foo FROM bar WHERE name = \\$name OR name = $label',
      values: params
    })

    expect(text).to.equal('SELECT foo FROM bar WHERE name = $name OR name = $1')
    expect(values).to.eql([params.label])
  })

  it('should execute an object with named parameters', async () => {
    const psql = Database.getEngine(app, engine)
    const c = await psql.connect()
    await c.query('DROP TABLE IF EXISTS tests_named_parameters')

    try {
      await c.query('CREATE TABLE tests_named_parameters (p1 TEXT, p2 TEXT)')
      await c.query(`
        INSERT INTO
          tests_named_parameters (p1, p2)
        VALUES
          ('foo', 'bar'),
          ('bar', 'foo')
      `)

      const result = await psql.query({
        text: 'SELECT * FROM tests_named_parameters WHERE p1 = $p1 AND p2 = $p2',
        values: {
          p1: 'foo',
          p2: 'bar'
        }
      })

      expect(result.rows.length).to.equal(1)
      expect(result.rows[0]).to.eql({
        p1: 'foo',
        p2: 'bar'
      })

      await c.query('DROP TABLE tests_named_parameters')
    } catch (err) {
      // Cleanup
      await c.query('ROLLBACK')
      throw err
    } finally {
      // Release the connections
      c.release()
    }
  })

  it('should not convert missing named parameters as a precaution', async () => {
    const psql = Database.getEngine(app, engine)
    const c = await psql.connect()
    await c.query('DROP TABLE IF EXISTS tests_named_parameters')

    try {
      await c.query('CREATE TABLE tests_named_parameters (p1 TEXT, p2 TEXT)')
      await c.query(`
        INSERT INTO
          tests_named_parameters (p1, p2)
        VALUES
          ('foo', '$p2'),
          ('bar', '$p1')
      `)

      const result = await psql.query({
        text: 'SELECT * FROM tests_named_parameters WHERE p1 = $p1 AND p2 = \'$p2\'',
        values: {
          p1: 'foo'
        }
      })

      expect(result.rows.length).to.equal(1)
      expect(result.rows[0]).to.eql({
        p1: 'foo',
        p2: '$p2'
      })

      await c.query('DROP TABLE tests_named_parameters')
    } catch (err) {
      // Cleanup
      await c.query('ROLLBACK')
      throw err
    } finally {
      // Release the connections
      c.release()
    }
  })

  it('should not convert escaped dollar sign in named parameters', async () => {
    const psql = Database.getEngine(app, engine)
    const c = await psql.connect()
    await c.query('DROP TABLE IF EXISTS tests_named_parameters')

    try {
      await c.query('CREATE TABLE tests_named_parameters (p1 TEXT, p2 TEXT)')
      await c.query(`
        INSERT INTO
          tests_named_parameters (p1, p2)
        VALUES
          ('foo', '$p2'),
          ('bar', '$p1')
      `)

      const result = await psql.query({
        text: 'SELECT * FROM tests_named_parameters WHERE p1 = $p1 AND p2 = \'\\$p2\'',
        values: {
          p1: 'foo'
        }
      })

      expect(result.rows.length).to.equal(1)
      expect(result.rows[0]).to.eql({
        p1: 'foo',
        p2: '$p2'
      })

      await c.query('DROP TABLE tests_named_parameters')
    } catch (err) {
      // Cleanup
      await c.query('ROLLBACK')
      throw err
    } finally {
      // Release the connections
      c.release()
    }
  })

  it('should get a cursor', async () => {
    const query = 'SELECT * FROM generate_series(1, 5)'

    const psql = Database.getEngine(app, engine)
    await psql.connect()

    const cursor = await psql.cursor(query)

    const r1 = await cursor.read(3)
    expect(r1.length).to.equal(3)

    const r2 = await cursor.read(3)
    expect(r2.length).to.equal(2)

    const r3 = await cursor.read(3)
    expect(r3.length).to.equal(0)

    cursor.close()
  })
})
