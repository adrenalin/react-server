const expect = require('expect.js')
const errors = require('@adrenalin/errors')
const { sleep } = require('@adrenalin/helpers.js')
const DatabaseService = require('../../../services/database')

describe('services/cache', () => {
  it('should have interface methods "query" and "connect"', async () => {
    const app = await require('../../../server/application')()
    app.config.set('services.database.engine', 'psql')

    const service = new DatabaseService(app)
    expect(service.query).to.be.a('function')
    expect(service.connect).to.be.a('function')
  })
})
