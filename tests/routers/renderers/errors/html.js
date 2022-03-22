const expect = require('expect.js')
const errors = require('@adrenalin/errors')
const { Localization } = require('@adrenalin/helpers.js')
const init = require('../../../init')

const configRouter = require('../../../../routers/application/config')
const errorRouter = require('../../../../routers/renderers/errors/html')

describe('routers/renderers/html', () => {
  let app, callback
  const testUrl = '/tests/routers/renderers/errors/html'

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

    const response = await app.tests.requests.basic
      .get(testUrl)
      .expect(501)

    expect(response.headers['content-type']).to.contain('text/html')
    expect(response.text).to.contain('<html')
    expect(response.text).to.contain(locale.fi)
  })
})
