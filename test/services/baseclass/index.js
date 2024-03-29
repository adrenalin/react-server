const { expect } = require('chai')
const Service = require('../../../services')

class TestService extends Service {
  static get SERVICE_NAME () {
    return 'testService'
  }
}

describe('services/index', () => {
  it('should list service dependencies', (done) => {
    expect(Service.DEPENDENCIES).to.be.a('array')
    done()
  })

  it('should share the application configuration', async () => {
    const app = await require('../../../server/application')()

    const service = new TestService(app)
    service.register()
    expect(service.config).to.equal(app.config)
  })
})
