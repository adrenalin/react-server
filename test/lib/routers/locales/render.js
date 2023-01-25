const { expect } = require('chai')
const request = require('supertest')
const init = require('../../../init')

const router = require('../../../../lib/routers/locales/render')
const altRouter = require('../../../../lib/routers/renderers/alt')
const configRouter = require('../../../../lib/routers/application/config')
const errorRouter = require('../../../../lib/routers/renderers/errors/api')
const langRouter = require('../../../../lib/routers/application/lang')

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
    const response = await request(app)
      .get(`${testUrl}/${lang}`)
      .expect(200)

    const locales = response.body.locales

    for (const locale in testLocales) {
      expect(locales[locale][lang]).to.eql(testLocales[locale][lang])
      expect(Object.keys(locales[locale]).length).to.equal(1)
    }
  })
})
