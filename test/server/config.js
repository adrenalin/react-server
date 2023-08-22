const { expect } = require('chai')
const { Config } = require('@vapaaradikaali/helpers.js')
const application = require('../../server/application')

describe('server/config', () => {
  const envConfig = process.env.CONFIG_FILE

  it('should register the configuration schema', async () => {
    const app = await application()
    app.config.set('middleware.renderers.foobar', {
      path: 'test-path',
      module: 'test-module'
    })

    try {
      app.config.set('middleware.renderers.foobar.module', ['foobar'])
      throw new Error('Should have thrown a ValidationError')
    } catch (err) {
      expect(err).to.be.an.instanceof(Config.errors.ValidationError)
    }
  })

  it('should allow only two character language codes', async () => {
    const app = await application()

    app.config.set('react.application.languages', ['it'])
    app.config.set('react.application.defaultLanguage', 'it')

    try {
      app.config.set('react.application.languages', ['foobar'])
      throw new Error('Should have thrown a ValidationError')
    } catch (err) {
      expect(err).to.be.an.instanceof(Config.errors.ValidationError)
    }

    try {
      app.config.set('react.application.defaultLanguage', 'foobar')
      throw new Error('Should have thrown a ValidationError')
    } catch (err) {
      expect(err).to.be.an.instanceof(Config.errors.ValidationError)
    }
  })

  it('should require enabled flag for all services', async () => {
    const app = await application()

    app.config.set('services.cache.enabled', true)
    app.config.set('services.cache.engine', 'redis')

    try {
      app.config.set('services.cache.enabled', null)
      throw new Error('Should have thrown a ValidationError')
    } catch (err) {
      expect(err).to.be.an.instanceof(Config.errors.ValidationError)
    }

    try {
      app.config.set('services.cache.engine', 'undefined')
      throw new Error('Should have thrown a ValidationError')
    } catch (err) {
      expect(err).to.be.an.instanceof(Config.errors.ValidationError)
    }
  })

  it('should load config by environment variable', async () => {
    process.env.CONFIG_FILE = 'test/resources/server/config/envConfig.yml'
    const app = await application()
    expect(app.config.get('envConfig')).to.eql('env-config')
  })

  it('should load config by argument', async () => {
    process.argv.push('--config-file=test/resources/server/config/argConfig.yml')
    const app = await application()
    expect(app.config.get('argConfig')).to.eql('arg-config')
  })
})
