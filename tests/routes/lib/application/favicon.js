const fs = require('fs')
const path = require('path')
const init = require('../../../init')
const router = require('../../../../routes/lib/application/favicon')
const configRouter = require('../../../../routes/lib/application/config')
const errorRouter = require('../../../../routes/lib/renderers/errors/api')

describe('routes/lib/application/favicon', () => {
  let app, favicon
  const testUrl = '/tests/routes/lib/application/favicon'

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
    await app.tests.requests.create().get(`${testUrl}/favicon.ico`)
      .expect(200)
  })

  it('should not find the favicon when the image does not exist', async () => {
    app.config.set('react.favicon', '/path/to/image/that/does/not/exist.png')
    await app.tests.requests.create().get(`${testUrl}/favicon.ico`)
      .expect(404)
  })
})
