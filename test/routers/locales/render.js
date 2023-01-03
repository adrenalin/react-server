const expect = require('expect.js')
const init = require('../../init')

const router = require('../../../routers/locales/render')
const altRouter = require('../../../routers/renderers/alt')
const configRouter = require('../../../routers/application/config')
const errorRouter = require('../../../routers/renderers/errors/api')
const langRouter = require('../../../routers/application/lang')

describe('routers/locales/render', () => {
  let app
  const testUrl = '/test/lib/locales/render'

  const testLocales = {
    [testUrl]: {
      fi: `${testUrl} fi`,
      en: `${testUrl} en`,
      it: `${testUrl} it`
    }
  }

  before(async () => {
    app = await init()
    app.services.l10n.registerLocales(testLocales)

    app.use(testUrl, configRouter(app))
    app.use(testUrl, langRouter(app))
    app.use(testUrl, router(app))
    app.use(testUrl, altRouter(app, ['Locales']))
    app.use(testUrl, errorRouter(app))
  })

  it('should find the locales for the given language', async () => {
    const lang = app.config.get('react.application.defaultLanguage')
    const response = await app.tests.requests.basic
      .get(`${testUrl}/${lang}`)
      .expect(200)

    const locales = response.body.locales

    for (const locale in testLocales) {
      expect(locales[locale][lang]).to.eql(testLocales[locale][lang])
      expect(Object.keys(locales[locale]).length).to.be(1)
    }
  })
})
