const expect = require('expect.js')
const Database = require('../../../lib/database')
const PsqlDatabase = require('../../../lib/database/psql')
const { Config } = require('@adrenalin/helpers.js')

describe('lib/database/psql', () => {
  const app = {
    config: new Config()
  }

  const engine = 'psql'

  it('should return a psql instance with factory method', (done) => {
    const psql = Database.getEngine(app, engine)
    expect(psql).to.be.a(PsqlDatabase)
    done()
  })
})
