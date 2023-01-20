const cheerio = require('cheerio')
const request = require('supertest')
const { expect } = require('chai')
const { getValue } = require('@vapaaradikaali/helpers.js')
const init = require('../../../init')

const router = require('../../../../routers/renderers/react')
const langRouter = require('../../../../routers/application/lang')
const configRouter = require('../../../../routers/application/config')
const errorRouter = require('../../../../routers/renderers/errors/api')

describe('routers/renderers/react:iso', () => {
  let app
  const react = {}
  const common = {}

  const testUrl = '/test/lib/renderers/react/iso'

  before(async () => {
    app = await init()

    common.name = app.config.get('site.host.name')
    common.port = app.config.get('site.host.port')
    common.ssl = app.config.get('site.host.ssl')

    react.name = app.config.get('react.host.name')
    react.port = app.config.get('react.host.port')
    react.ssl = app.config.get('react.host.ssl')

    app.use(testUrl, configRouter(app))
    app.use(testUrl, langRouter(app))
    app.use(testUrl, router(app))
    app.use(testUrl, errorRouter(app))
  })

  afterEach(async () => {
    for (const key in react) {
      app.config.set(`react.host.${key}`, react[key])
    }

    for (const key in common) {
      app.config.set(`host.${key}`, common[key])
    }
  })

  it('should include Iso bootstapped Alt stores', async () => {
    const lang = app.config.get('react.languages', ['fi'])[0]
    const url = `${testUrl}/${lang}`

    const response = await request(app)
      .get(url)
      .expect(200)

    const $ = cheerio.load(response.text)
    const iso = $('script[type="application/json"][data-iso-key]')

    expect(iso.length).to.equal(1)

    const stores = JSON.parse(JSON.parse(iso.html()))

    expect(stores).to.have.property('ApplicationStore')
    expect(getValue(stores, 'ApplicationStore.currentUrl')).to.eql(url)
    expect(getValue(stores, 'ApplicationStore.location')).to.eql(url.substr(testUrl.length))
    expect(getValue(stores, 'ApplicationStore.lang')).to.eql(lang)
  })

  it('should respect the commonly configured host, port and ssl', async () => {
    const port = 1000
    const host = 'tests-lib-react-iso-common-configured'
    const ssl = true

    app.config.set('site.host.name', host)
    app.config.set('site.host.port', port)
    app.config.set('site.host.ssl', ssl)

    app.config.set('react.host.name', null)
    app.config.set('react.host.port', null)
    app.config.set('react.host.ssl', null)

    const lang = app.config.get('react.languages', ['fi'])[0]
    const url = `${testUrl}/${lang}`
    const siteUrl = `${ssl ? 'https' : 'http'}://${host}:${port}`
    const fullUrl = `${siteUrl}${url}`

    const response = await request(app)
      .get(url)
      .set('host', host)
      .expect(200)

    const $ = cheerio.load(response.text)
    const iso = $('script[type="application/json"][data-iso-key]')

    expect(iso.length).to.equal(1)

    const stores = JSON.parse(JSON.parse(iso.html()))

    expect(stores).to.have.property('ApplicationStore')
    expect(getValue(stores, 'ApplicationStore.siteUrl')).to.eql(siteUrl)
    expect(getValue(stores, 'ApplicationStore.fullUrl')).to.eql(fullUrl)
  })

  it('should respect the per-request configured host, port and ssl', async () => {
    const port = 1001
    const host = 'tests-lib-react-iso-react-configured'
    const ssl = false

    app.config.set('react.host.name', host)
    app.config.set('react.host.port', port)
    app.config.set('react.host.ssl', ssl)

    const lang = app.config.get('react.languages', ['fi'])[0]
    const url = `${testUrl}/${lang}`
    const siteUrl = `${ssl ? 'https' : 'http'}://${host}:${port}`
    const fullUrl = `${siteUrl}${url}`

    const response = await request(app)
      .get(url)
      .set('host', host)
      .expect(200)

    const $ = cheerio.load(response.text)
    const iso = $('script[type="application/json"][data-iso-key]')

    expect(iso.length).to.equal(1)

    const stores = JSON.parse(JSON.parse(iso.html()))

    expect(stores).to.have.property('ApplicationStore')
    expect(getValue(stores, 'ApplicationStore.siteUrl')).to.eql(siteUrl)
    expect(getValue(stores, 'ApplicationStore.fullUrl')).to.eql(fullUrl)
  })
})
