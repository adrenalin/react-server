const { expect } = require('chai')
const request = require('supertest')
const init = require('../../../init')

const router = require('../../../../lib/routers/locales/list')
const altRouter = require('../../../../lib/routers/renderers/alt')
const errorRouter = require('../../../../lib/routers/renderers/errors/api')

describe('routers/locales/list', () => {
  let app
  const testUrl = '/test/lib/routers/locales/list'

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

    app.use(testUrl, router(app))
    app.use(testUrl, altRouter(app, ['Locales']))
    app.use(testUrl, errorRouter(app))
  })

  it('should find the locales list for all languages', async () => {
    const response = await request(app).get(testUrl)
      .expect(200)

    expect(response.body).to.have.property('locales')

    for (const locale in testLocales) {
      expect(response.body.locales[locale]).to.eql(testLocales[locale])
    }
  })

  it('should find the locales list for the given language', async () => {
    const lang = 'it'
    const response = await request(app).get(`${testUrl}/${lang}`)
      .expect(200)

    expect(response.body).to.have.property('locales')

    for (const locale in testLocales) {
      expect(response.body.locales[locale]).to.eql(testLocales[locale][lang])
    }
  })
})
