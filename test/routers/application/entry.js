const { expect } = require('chai')
const request = require('supertest')
const init = require('../../init')

const router = require('../../../routers/application/entry')
const configRouter = require('../../../routers/application/config')
const errorRouter = require('../../../routers/renderers/errors/api')

describe('routers/application/entry', () => {
  let app, configuredLang, configuredLanguages
  const testUrl = '/test/routers/application/entry'

  const languages = ['fi', 'en']
  const defaultLang = languages[0]
  const statusCode = 302

  before(async () => {
    app = await init()

    configuredLang = app.config.get('react.application.defaultLanguage')
    configuredLanguages = app.config.get('react.application.languages', languages)

    app.use(testUrl, configRouter(app))
    app.use(testUrl, router(app, { statusCode }))
    app.use(testUrl, errorRouter(app))
  })

  after(async () => {
    app.config.set('react.application.defaultLanguage', configuredLang)
    app.config.set('react.application.languages', configuredLanguages)
  })

  it('should redirect to the default language', async () => {
    const response = await request(app).get(testUrl)
      .expect(statusCode)

    expect(response.headers.location).to.equal(`./${defaultLang}`)
  })

  it('should redirect to the user preferred language with accept-language headers', async () => {
    const response = await request(app).get(testUrl)
      .set({
        'accept-language': 'en-US,en;q=0.8,fi;q=0.5,it;q=0.3'
      })
      .expect(302)

    expect(response.headers.location).to.equal('./en')
  })

  it('should redirect to the defalt language with accept-language headers without an included language', async () => {
    const response = await request(app).get(testUrl)
      .set({
        'accept-language': 'it;q=0.8'
      })
      .expect(302)

    expect(response.headers.location).to.equal(`./${defaultLang}`)
  })
})
