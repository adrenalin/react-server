const { expect } = require('chai')
const request = require('supertest')
const cheerio = require('cheerio')
const errors = require('@vapaaradikaali/errors')
const init = require('../../../../init')

const router = require('../../../../../lib/routers/renderers/react')
const langRouter = require('../../../../../lib/routers/application/lang')
const configRouter = require('../../../../../lib/routers/application/config')
const errorRouter = require('../../../../../lib/routers/renderers/errors/react')

describe('routers/renderers/react:errors', () => {
  let app, callback, siteTitle, siteLogo
  const testUrl = '/test/lib/renderers/react/errors'

  before(async () => {
    app = await init()

    app.use(testUrl, configRouter(app))
    app.use(testUrl, langRouter(app))
    app.use(testUrl, (req, res, next) => {
      callback(req, res, next)
    })
    app.use(testUrl, router(app))
    app.use(testUrl, errorRouter(app))

    siteTitle = app.config.get('react.application.site.title')
    siteLogo = app.config.get('react.application.site.logo')
  })

  afterEach(async () => {
    app.config.set('react.application.site.title', siteTitle)
    app.config.set('react.application.site.logo', siteLogo)
  })

  beforeEach(async () => {
    callback = (req, res, next) => {
      next()
    }
  })

  it('should render error page when React throws an unhandled render error', async () => {
    const lang = app.config.get('react.languages', ['fi'])[0]
    const url = `${testUrl}/${lang}/undefined`

    const response = await request(app)
      .get(url)
      .expect(500)

    expect(response.text).to.have.string(testUrl)
  })

  it('should receive form validation errors', async () => {
    const lang = app.config.get('react.languages', ['fi'])[0]
    const error = 'Bad Request'
    const errs = {
      foo: 'error 1',
      bar: 'error 2'
    }
    const data = {
      foo: 1,
      bar: 2
    }

    callback = (req, res, next) => {
      const err = new errors.FormValidation(errs, data)
      next(err)
    }

    const response = await request(app)
      .get(`${testUrl}/${lang}/formvalidation`)
      .expect(400)

    const $ = cheerio.load(response.text)
    const stored = JSON.parse($('#errorStore').text())
    expect(stored).to.eql({ error, errors: errs, data, code: 400 })
  })

  it('should pass site title and logo to the view', async () => {
    const testTitle = 'react-errors-test-site-title'
    const testLogo = 'react-errors-test-site-logo.svg'

    app.config.set('react.application.site.title', testTitle)
    app.config.set('react.application.site.logo', testLogo)

    const response = await request(app).get(`${testUrl}/fi`)
      .expect(200)

    const body = String(response.text)
    expect(body).to.have.string(testTitle)
    expect(body).to.have.string(testLogo)
  })
})
