const expect = require('expect.js')
const init = require('../../../../init')

const router = require('../../../../../routes/lib/renderers/react')
const configRouter = require('../../../../../routes/lib/application/config')
const errorRouter = require('../../../../../routes/lib/renderers/errors/api')

describe('routes/lib/renderers/react:render', () => {
  let app
  const testUrl = '/tests/lib/renderers/react/render'

  before(async () => {
    app = await init()

    app.use(testUrl, configRouter(app))
    app.use(testUrl, router(app))
    app.use(testUrl, errorRouter(app))
  })

  it('should render the configured project', async () => {
    const response = await app.tests.requests.create().get(`${testUrl}/fi`)
      .expect(200)

    const body = String(response.text)
    expect(body).to.contain('TestRender')
  })

  it('should render a not found error for an unconfigured route', async () => {
    await app.tests.requests.create().get(`${testUrl}/path/not/found`)
      .expect(404)
  })
})
