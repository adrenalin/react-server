const request = require('supertest')
const init = require('../../init')
const router = require('../../../routers/application/favicon')
const configRouter = require('../../../routers/application/config')
const errorRouter = require('../../../routers/renderers/errors/api')

describe('routers/application/favicon', () => {
  let app, favicon
  const testUrl = '/test/routers/application/favicon'

  before(async () => {
    app = await init()
    app.use(testUrl, configRouter(app))
    app.use(testUrl, router(app))
    app.use(testUrl, errorRouter(app))

    favicon = app.config.get('react.application.favicon')
  })

  after(async () => {
    app.config.set('react.application.favicon', favicon)
  })

  it('should find the favicon when the image exists', async () => {
    app.config.set('react.favicon', '../../index.js')
    await request(app).get(`${testUrl}/favicon.ico`)
      .expect(200)
  })

  it('should not find the favicon when the image does not exist', async () => {
    app.config.set('react.favicon', '/path/to/image/that/does/not/exist.png')
    await request(app).get(`${testUrl}/favicon.ico`)
      .expect(404)
  })
})
