const { expect } = require('chai')
const init = require('../../../init')

const router = require('../../../../routers/renderers/react')
const configRouter = require('../../../../routers/application/config')
const errorRouter = require('../../../../routers/renderers/errors/api')

describe('routers/renderers/react:files', () => {
  let app, minified, fingerprint
  const testUrl = '/test/lib/renderers/react/files'

  before(async () => {
    app = await init()

    minified = app.config.get('react.minified')
    fingerprint = app.config.get('react.fingerprint')

    app.use(testUrl, configRouter(app))
    app.use(testUrl, router(app))
    app.use(testUrl, errorRouter(app))
  })

  afterEach(async () => {
    app.config.set('react.minified', minified)
    app.config.set('react.fingerprint', fingerprint)
  })

  it('should render the configured stylesheets', async () => {
    app.config.set('react.minified', true)
    app.config.set('react.fingerprint', false)

    const response = await app.tests.requests.create().get(`${testUrl}/en`)
      .expect(200)

    app.config.get('react.stylesheets')
      .forEach((stylesheet) => {
        expect(response.text).to.have.string(`href="${stylesheet}"`)
      })
  })

  it('should render the configured stylesheets without minified when configured', async () => {
    app.config.set('react.minified', false)
    app.config.set('react.fingerprint', false)

    const response = await app.tests.requests.create().get(`${testUrl}/en`)
      .expect(200)

    app.config.get('react.stylesheets')
      .forEach((stylesheet) => {
        expect(response.text).to.have.string(`href="${stylesheet.replace(/\.min/, '')}"`)
      })
  })

  it('should include the entry JS file', async () => {
    app.config.set('react.minified', false)
    app.config.set('react.fingerprint', false)

    const response = await app.tests.requests.create().get(`${testUrl}/en`)
      .expect(200)

    expect(response.text).to.have.string(`src="/js/${app.config.get('react.entry')}.js"`)
  })

  it('should include the minified entry JS file and vendors', async () => {
    app.config.set('react.minified', true)
    app.config.set('react.fingerprint', false)

    const response = await app.tests.requests.create().get(`${testUrl}/en`)
      .expect(200)

    expect(response.text).to.have.string('src="/js/vendors.min.js"')
    expect(response.text).to.have.string(`src="/js/${app.config.get('react.entry')}.min.js"`)
  })

  it('should apply commit fingerprint to the static files', async () => {
    app.config.set('react.minified', true)
    app.config.set('react.fingerprint', true)

    const response = await app.tests.requests.create().get(`${testUrl}/en`)
      .expect(200)

    const files = [
      '/js/vendors.min.js',
      `/js/${app.config.get('react.entry')}.min.js`
    ]

    files
      .forEach((file) => {
        const match = new RegExp(`src="${file}\\?[0-9a-f]+"`)
        expect(response.text).to.match(match)
      })

    app.config.get('react.stylesheets')
      .forEach((stylesheet) => {
        const match = new RegExp(`href="${stylesheet}\\?[0-9a-f]+"`)
        expect(response.text).to.match(match)
      })
  })
})
