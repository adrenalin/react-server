const { expect } = require('chai')
// const errors = require('@adrenalin/errors')
const DatabaseService = require('../../../services/database')

describe('services/database', () => {
  it('should register the service', async () => {
    const app = await require('../../../server/application')()
    app.config.set('services.database.engine', 'psql')

    const service = new DatabaseService(app)
    const registered = await service.register()

    expect(service).to.equal(registered)
  })

  it('should have interface methods "query", "connect" and "getClient"', async () => {
    const app = await require('../../../server/application')()
    app.config.set('services.database.engine', 'psql')

    const service = new DatabaseService(app)
    expect(service.query).to.be.a('function')
    expect(service.connect).to.be.a('function')
    expect(service.getClient).to.be.a('function')
  })

  it('should connect to the database service', async () => {
    const app = await require('../../../server/application')()
    app.config.set('services.database.engine', 'psql')

    const service = new DatabaseService(app)
    await service.connect()
  })

  it('should pass the query to the database service', async () => {
    const app = await require('../../../server/application')()
    app.config.set('services.database.engine', 'psql')

    const service = new DatabaseService(app)
    await service.connect()

    const response = await service.query({
      text: 'SELECT NOW()'
    })

    expect(response.rows[0]).to.have.property('now')
  })
})
