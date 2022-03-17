const cheerio = require('cheerio')
const expect = require('expect.js')
const { castToArray } = require('@adrenalin/helpers.js')
const init = require('../../../init')

const router = require('../../../../routers/renderers/react')
const langRouter = require('../../../../routers/application/lang')
const configRouter = require('../../../../routers/application/config')
const errorRouter = require('../../../../routers/renderers/errors/api')

describe('routes/lib/renderers/react:metadata', () => {
  let app, siteImage, defaultLocale, defaultLocales, defaultLanguages
  const testUrl = '/tests/lib/renderers/react/metadata'

  const react = {}
  const common = {}

  before(async () => {
    app = await init()

    siteImage = app.config.get('react.application.site.image')

    const attrs = ['name', 'port', 'ssl']

    attrs
      .forEach((key) => {
        common[key] = app.config.get(`site.host.${key}`)
        react[key] = app.config.get(`react.host.${key}`)
      })

    defaultLanguages = app.config.get('react.site.languages')
    defaultLocale = app.config.get('react.defaultLocale')
    defaultLocales = app.config.get('react.locales')

    app.use(testUrl, configRouter(app))
    app.use(testUrl, langRouter(app))
    app.use(testUrl, router(app))
    app.use(testUrl, errorRouter(app))
  })

  afterEach(async () => {
    app.config.set('react.application.site.image', siteImage)
    app.config.set('react.application.languages', defaultLanguages)
    app.config.set('react.defaultLocale', defaultLocale)
    app.config.set('react.locales', defaultLocales)

    for (const key in react) {
      app.config.set(`react.host.${key}`, react[key])
    }

    for (const key in common) {
      app.config.set(`host.${key}`, common[key])
    }
  })

  /**
   * Get meta tags from a response
   */
  const getMetaTags = (body) => {
    const tags = {}
    const $ = cheerio.load(body)

    $('meta').each((i, el) => {
      const key = $(el).attr('property') || $(el).attr('name')
      const value = $(el).attr('content')

      if (key === 'og:image') {
        tags[key] = castToArray(tags[key])
        tags[key].push(value)
        return
      }

      tags[key] = value
    })

    return tags
  }

  it('should include metadata', async () => {
    const lang = app.config.get('react.application.languages', ['fi'])[0]
    const url = `${testUrl}/${lang}`

    const response = await app.tests.requests.create()
      .get(url)
      .expect(200)

    const tags = getMetaTags(response.text)

    expect(tags['og:title']).to.eql(tags['dc.title'])
    expect(tags['og:description']).to.eql(tags['dc.description'])

    expect(tags['og:title']).to.contain('testPageTitle')
    expect(tags['og:description']).to.contain('testPageDescription')
  })

  it('should prepend site url to metadata images', async () => {
    const host = 'tests-lib-react-metadata-image-prefix'
    const port = 1234
    const ssl = false

    const lang = app.config.get('react.languages', ['fi'])[0]
    const url = `${testUrl}/${lang}`
    const siteUrl = `${ssl ? 'https' : 'http'}://${host}:${port}`

    const testImageGeneric = `${testUrl}/generic.png`
    const testImageComponent = `${testUrl}/component.png`

    app.config.set('react.host.name', host)
    app.config.set('react.host.port', port)
    app.config.set('react.host.ssl', ssl)

    app.config.set('react.application.site.image', testImageGeneric)
    app.config.set('react.application.tests.lib.react.metadata.image', testImageComponent)

    const response = await app.tests.requests.create()
      .get(url)
      .expect(200)

    const tags = getMetaTags(response.text)
    const images = tags['og:image']

    // Added by client/test/test/index.js, shall have priority
    expect(images[0]).to.eql(`${siteUrl}${testImageComponent}`)

    // Generic site image, shall be displayed last
    expect(images[images.length - 1]).to.be(`${siteUrl}${testImageGeneric}`)
  })

  it('should have alternate link content to other locales', async () => {
    const host = 'tests-lib-react-metadata-alternate'
    const port = 1234
    const ssl = false

    const locales = {
      fi: 'fi_FI',
      sv: 'sv_FI',
      en: 'en_US'
    }

    const languages = Object.keys(locales)

    const lang = 'fi'
    const url = `${testUrl}/${lang}`
    const siteUrl = `${ssl ? 'https' : 'http'}://${host}:${port}`

    app.config.set('react.host.name', host)
    app.config.set('react.host.port', port)
    app.config.set('react.host.ssl', ssl)

    app.config.set('react.locales', locales)
    app.config.set('react.application.languages', languages)

    const response = await app.tests.requests.create()
      .get(url)
      .expect(200)

    const $ = cheerio.load(response.text)

    const alternate = {}

    $('link[rel="alternate"]').each((i, el) => {
      alternate[$(el).attr('hreflang')] = $(el).attr('href')
    })

    expect(alternate['en-us']).to.eql(`${siteUrl}${testUrl}/en`)
    expect(alternate['sv-fi']).to.eql(`${siteUrl}${testUrl}/sv`)
    expect(alternate).not.to.contain('fi-fi')
  })
})
