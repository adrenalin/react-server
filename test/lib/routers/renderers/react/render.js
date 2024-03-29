const { expect } = require('chai')
const request = require('supertest')
const { setValue } = require('@vapaaradikaali/helpers.js')

const init = require('../../../../init')

const router = require('../../../../../lib/routers/renderers/react')
const configRouter = require('../../../../../lib/routers/application/config')
const errorRouter = require('../../../../../lib/routers/renderers/errors/api')

describe('routers/renderers/react:render', () => {
  let app, siteTitle, siteLogo, template, callback
  const testUrl = '/test/lib/renderers/react/render'

  before(async () => {
    app = await init()

    app.use(testUrl, configRouter(app))
    app.use(testUrl, (req, res, next) => {
      callback(req, res, next)
    })
    app.use(testUrl, router(app))
    app.use(testUrl, errorRouter(app))

    siteTitle = app.config.get('react.application.site.title')
    siteLogo = app.config.get('react.application.site.logo')
    template = app.config.get('react.template')
  })

  beforeEach(async () => {
    callback = (req, res, next) => {
      next()
    }
  })

  afterEach(async () => {
    app.config.set('react.application.site.title', siteTitle)
    app.config.set('react.application.site.logo', siteLogo)
    app.config.set('react.template', template)
  })

  it('should render the configured project', async () => {
    const response = await request(app).get(`${testUrl}/fi`)
      .expect(200)

    const body = String(response.text)
    expect(body).to.have.string('TestRender')
  })

  it('should render a not found error for an unconfigured route', async () => {
    await request(app).get(`${testUrl}/path/not/found`)
      .expect(404)
  })

  it('should pass site title and logo to the view', async () => {
    const testTitle = 'react-render-test-site-title'
    const testLogo = 'react-render-test-site-logo.svg'

    app.config.set('react.application.site.title', testTitle)
    app.config.set('react.application.site.logo', testLogo)

    const response = await request(app).get(`${testUrl}/fi`)
      .expect(200)

    const body = String(response.text)
    expect(body).to.have.string(testTitle)
    expect(body).to.have.string(testLogo)
  })

  it('should pass rendeder request data to the view', async () => {
    callback = (req, res, next) => {
      setValue(res, 'locals.data.renderer.testUrl', testUrl)
      next()
    }

    const response = await request(app)
      .get(`${testUrl}/fi`)
      .expect(200)

    // Renderer - when set - is serialized as JSON in the view "views/index.html"
    expect(response.text).to.have.string(`"testUrl":"${testUrl}"`)
  })

  it('should render with the template defined in config', async () => {
    app.config.set('react.template', 'renderTest')
    const response = await request(app)
      .get(`${testUrl}/fi`)
      .expect(200)

    // console.log(Object.keys(response))
    expect(response.text).to.eql('renderTest\n')
  })

  it('should render with the template defined in local config', async () => {
    const hostname = 'testhost'

    app.config.set(`sites.${hostname}.template`, 'renderTest')
    app.config.set(`sites.${hostname}.hosts`, [hostname])

    const response = await request(app)
      .get(`${testUrl}/fi`)
      .set({ host: hostname })
      .expect(200)

    // console.log(Object.keys(response))
    expect(response.text).to.eql('renderTest\n')
  })
})
