const { expect } = require('chai')
const request = require('supertest')
const init = require('../../init')

const router = require('../../../routers/application/health')
const altRouter = require('../../../routers/renderers/alt')

describe('routers/application/health', () => {
  let app
  const testUrl = '/test/routers/application/health'

  before(async () => {
    app = await init()

    app.use(testUrl, router(app))
    app.use(testUrl, altRouter(app, ['Health']))
  })

  it('should find the health route', async () => {
    const response = await request(app).get(testUrl)
      .expect(200)

    expect(response.body).to.have.property('status')
    expect(response.body.status).to.equal('ok')

    expect(response.body).to.have.property('uptime')
    expect(response.body.uptime).to.be.a('string')

    expect(response.body).to.have.property('started')
    expect(response.body.started).to.be.a('string')
  })
})
