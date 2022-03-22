const expect = require('expect.js')
const { getValue } = require('@adrenalin/helpers.js')
const init = require('../../init')

const router = require('../../../routers/application/config')
const altRouter = require('../../../routers/renderers/alt')
const errorRouter = require('../../../routers/renderers/errors/api')

describe('routers/application/config', () => {
  let app
  const testUrl = '/tests/lib/application/config'
  const testConfigPath = testUrl.replace(/\//g, '.').replace(/^\./, '')

  before(async () => {
    app = await init()

    app.use(testUrl, router(app))
    app.use(testUrl, altRouter(app, ['Application']))
    app.use(testUrl, errorRouter(app))
  })

  it('should find the application store', async () => {
    const response = await app.tests.requests.create().get(testUrl)
      .expect(200)

    expect(response.body).to.have.property('config')
  })

  it('should find the application store', async () => {
    const response = await app.tests.requests.create().get(testUrl)
      .expect(200)

    expect(response.body).to.have.property('config')
  })

  it('should find a set configuration value', async () => {
    app.config.set(`react.application.${testConfigPath}`, testUrl)

    const response = await app.tests.requests.create().get(testUrl)
      .expect(200)

    const config = JSON.parse(JSON.stringify(response.body.config))
    expect(getValue(config, testConfigPath)).to.eql(testUrl)
  })

  it('should find a per-site configuration value', async () => {
    const host = 'tests-lib-application-index'
    const overrideConfigValue = 'per-site-config-value'

    app.config.set(`react.application.${testConfigPath}`, testUrl)

    app.config.set(`sites.${host}.hosts`, [host])
    app.config.set(`sites.${host}.application.${testConfigPath}`, overrideConfigValue)

    const response = await app.tests.requests.create()
      .setHeader('host', host)
      .get(testUrl)
      .expect(200)

    const config = JSON.parse(JSON.stringify(response.body.config))
    expect(getValue(config, testConfigPath)).to.eql(overrideConfigValue)
  })

  it('should find merged configuration values', async () => {
    const host = 'tests-lib-application-index'
    const overrideConfigValue = 'per-site-config-value'

    app.config.set(`react.application.merged.${testConfigPath}.foo`, testUrl)

    app.config.set(`sites.${host}.hosts`, [host])
    app.config.set(`sites.${host}.application.merged.${testConfigPath}.bar`, overrideConfigValue)

    const response = await app.tests.requests.create()
      .setHeader('host', host)
      .get(testUrl)
      .expect(200)

    const config = JSON.parse(JSON.stringify(response.body.config))
    expect(getValue(config, `merged.${testConfigPath}.foo`)).to.eql(testUrl)
    expect(getValue(config, `merged.${testConfigPath}.bar`)).to.eql(overrideConfigValue)
  })
})
