const { expect } = require('chai')
const request = require('supertest')
const errors = require('@vapaaradikaali/errors')
const { setValue, Localization } = require('@vapaaradikaali/helpers.js')
const init = require('../../../../init')

const configRouter = require('../../../../../lib/routers/application/config')
const errorRouter = require('../../../../../lib/routers/renderers/errors/html')

describe('routers/renderers/html', () => {
  let app, callback
  const testUrl = '/test/lib/routers/renderers/errors/html'

  before(async () => {
    app = await init()
    app.use(testUrl, configRouter(app))
    app.use(testUrl, (req, res, next) => {
      req.lang = 'fi'
      callback(req, res, next)
    })

    app.use(testUrl, errorRouter(app))
  })

  it('should render a HTML error page', async () => {
    // Test localization
    const errorDescription = 'testsRoutesLibErrorsHtmlNotImplemented'
    const locale = {
      fi: `${errorDescription} fi`,
      en: `${errorDescription} en`
    }

    Localization.registerLocale(errorDescription, locale)

    callback = (req, res, next) => {
      next(new errors.NotImplemented(errorDescription))
    }

    const response = await request(app)
      .get(testUrl)
      .expect(501)

    expect(response.headers['content-type']).to.have.string('text/html')
    expect(response.text).to.have.string('<html')
    expect(response.text).to.have.string(locale.fi)
  })

  it('should pass rendeder request data to the view', async () => {
    callback = (req, res, next) => {
      setValue(res, 'locals.data.renderer.testUrl', testUrl)
      next(new errors.NotImplemented('Renderer error'))
    }

    const response = await request(app)
      .get(testUrl)
      .expect(501)

    // Renderer - when set - is serialized as JSON in the view "views/index.html"
    expect(response.text).to.have.string(`"testUrl":"${testUrl}"`)
  })
})
