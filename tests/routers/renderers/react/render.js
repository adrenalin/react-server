const expect = require('expect.js')
const init = require('../../../init')

const router = require('../../../../routers/renderers/react')
const configRouter = require('../../../../routers/application/config')
const errorRouter = require('../../../../routers/renderers/errors/api')

describe('routers/renderers/react:render', () => {
  let app, siteTitle, siteLogo
  const testUrl = '/tests/lib/renderers/react/render'

  before(async () => {
    app = await init()

    app.use(testUrl, configRouter(app))
    app.use(testUrl, router(app))
    app.use(testUrl, errorRouter(app))

    siteTitle = app.config.get('react.application.site.title')
    siteLogo = app.config.get('react.application.site.logo')
  })

  afterEach(async () => {
    app.config.set('react.application.site.title', siteTitle)
    app.config.set('react.application.site.logo', siteLogo)
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

  it('should pass site title and logo to the view', async () => {
    const testTitle = 'react-render-test-site-title'
    const testLogo = 'react-render-test-site-logo.svg'

    app.config.set('react.application.site.title', testTitle)
    app.config.set('react.application.site.logo', testLogo)

    const response = await app.tests.requests.create().get(`${testUrl}/fi`)
      .expect(200)

    const body = String(response.text)
    expect(body).to.contain(testTitle)
    expect(body).to.contain(testLogo)
  })
})
