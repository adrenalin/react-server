const expect = require('expect.js')
const { Localization } = require('@adrenalin/helpers.js')
const init = require('../../init')

const router = require('../../../routers/application/lang')
const configRouter = require('../../../routers/application/config')

describe('routes/lib/application/lang', () => {
  let app, configuredLang, configuredLanguages, callback
  const testUrl = '/tests/lib/application/lang'

  before(async () => {
    app = await init()

    configuredLang = app.config.get('react.application.defaultLanguage')
    configuredLanguages = app.config.get('react.application.languages', [])

    app.use(testUrl, configRouter(app))
    app.use(testUrl, router(app))
    app.use(testUrl, (req, res, next) => {
      callback(req, res, next)
    })
    app.use(testUrl, (req, res, next) => {
      res.json({
        lang: req.lang
      })
    })
  })

  beforeEach(async () => {
    callback = (req, res, next) => {
      next()
    }
  })

  after(async () => {
    app.config.set('react.application.defaultLanguage', configuredLang)
    app.config.set('react.application.languages', configuredLanguages)
  })

  it('should use the default language for the root', async () => {
    const lang = 'xx'

    app.config.set('react.application.defaultLanguage', lang)

    const response = await app.tests.requests.create()
      .get(testUrl)
      .expect(200)

    expect(response.body).to.have.property('lang')
    expect(response.body.lang).to.be(lang)
  })

  it('should apply the request lang when available', async () => {
    const defaultLang = 'xx'
    const languages = ['xa', 'xx', 'xy']

    app.config.set('react.application.defaultLanguage', defaultLang)
    app.config.set('react.application.languages', languages)

    const response = await app.tests.requests.create()
      .get(`${testUrl}/${languages[0]}`)
      .expect(200)

    expect(response.body).to.have.property('lang')
    expect(response.body.lang).to.be(languages[0])
  })

  it('should use the request language for subpaths', async () => {
    const defaultLang = 'xx'
    const languages = ['xa', 'xx', 'xy']

    app.config.set('react.application.defaultLanguage', defaultLang)
    app.config.set('react.application.languages', languages)

    const response = await app.tests.requests.create()
      .get(`${testUrl}/${languages[0]}/sub/path`)
      .expect(200)

    expect(response.body).to.have.property('lang')
    expect(response.body.lang).to.be(languages[0])
  })

  it('should apply the default lang when the request language is not available', async () => {
    const defaultLang = 'xx'
    const languages = ['xa', 'xx', 'xy']

    app.config.set('react.application.defaultLanguage', defaultLang)
    app.config.set('react.application.languages', languages)

    const response = await app.tests.requests.create()
      .get(`${testUrl}/zz`)
      .expect(200)

    expect(response.body).to.have.property('lang')
    expect(response.body.lang).to.be(defaultLang)
  })

  it('should apply the language in GET query when applicable', async () => {
    const defaultLang = 'xx'
    const languages = ['xa', 'xx', 'xy']

    app.config.set('react.application.defaultLanguage', defaultLang)
    app.config.set('react.application.languages', languages)

    const response = await app.tests.requests.create()
      .get(`${testUrl}?lang=${languages[2]}`)
      .expect(200)

    expect(response.body).to.have.property('lang')
    expect(response.body.lang).to.be(languages[2])
  })

  it('should have a localization instance in the request', async () => {
    const defaultLang = 'xx'
    const languages = ['xa', 'xx', 'xy']
    const lang = languages[0]
    const successString = 'Success'

    Localization.registerLocale(testUrl, {
      [lang]: successString,
      [defaultLang]: 'Failure'
    })

    app.config.set('react.application.defaultLanguage', defaultLang)
    app.config.set('react.application.languages', languages)

    callback = (req, res, next) => {
      expect(req.l10n).to.be.a(Localization)
      expect(req.l10n.get(testUrl)).to.eql(successString)
      next()
    }

    await app.tests.requests.create()
      .get(`${testUrl}/${lang}`)
      .expect(200)
  })
})
