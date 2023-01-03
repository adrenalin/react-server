const path = require('path')
const { expect } = require('chai')
const { Localization } = require('@adrenalin/helpers.js')
const init = require('../../init')

const Service = require('../../../services')
const L10nService = require('../../../services/l10n')

describe('services/l10n', () => {
  let app, localesPath

  before(async () => {
    app = await init()
    localesPath = app.config.get('services.l10n.path')
  })

  beforeEach(async () => {
    app.config.set('services.l10n.enabled', false)
    app.config.set('services.l10n.path', localesPath)
  })

  it('should load l10n service', (done) => {
    app.config.set('services.l10n.enabled', true)
    const l10n = new L10nService(app)
    expect(l10n).to.be.an.instanceof(Service)
    done()
  })

  it('should automatically load the configured locales', async () => {
    app.config.set('services.l10n.path', path.join(__dirname, '..', '..', 'resources', 'services', 'l10n'))
    const l10n = new L10nService(app)
    await l10n.register()

    expect(l10n.get('fi', 'autoload')).to.eql('Automaattisesti ladattu')
    expect(l10n.get('en', 'autoload')).to.eql('Automatically loaded')
  })

  it('should return a Localization instance', async () => {
    const l10n = new L10nService(app)
    await l10n.register()

    const instance = l10n.getInstance()
    expect(instance).to.be.an.instanceof(Localization)
  })

  it('should get public registered locales and ignore private', async () => {
    const testLocales = {
      testLocale: {
        translations: {
          fi: 'test-locale-fi',
          en: 'test-locale-en'
        }
      },
      testPrivateLocale: {
        private: true,
        translations: {
          fi: 'test-private-locale-fi',
          en: 'test-private-locale-en'
        }
      }
    }
    const l10n = new L10nService(app)
    await l10n.register()
    l10n.registerLocales(testLocales)

    const locales = l10n.getLocales()
    expect(locales).to.have.property('testLocale')
    expect(locales.testLocale).to.eql(testLocales.testLocale.translations)

    expect(locales).not.to.have.property('testPrivateLocale')
  })

  it('should get all registered locales when ignorePrivate flag is false', async () => {
    const testLocales = {
      testPrivateLocale: {
        private: true,
        translations: {
          fi: 'test-private-locale-fi',
          en: 'test-private-locale-en'
        }
      }
    }
    const l10n = new L10nService(app)
    await l10n.register()
    l10n.registerLocales(testLocales)

    const locales = l10n.getLocales(null, false)
    expect(locales).to.have.property('testPrivateLocale')
  })

  it('should get flat key-value object when language is defined', async () => {
    const testLocales = {
      testLocale: {
        translations: {
          fi: 'test-locale-fi',
          en: 'test-locale-en'
        }
      }
    }
    const l10n = new L10nService(app)
    await l10n.register()
    l10n.registerLocales(testLocales)

    const locales = l10n.getLocales('fi', false)
    expect(locales).to.have.property('testLocale')
    expect(locales.testLocale).to.eql(testLocales.testLocale.translations.fi)
  })

  it('should register locale aliases', async () => {
    const testLocales = {
      testLocale: {
        translations: {
          fi: 'test-locale-fi',
          en: 'test-locale-en'
        }
      },
      testAlias: {
        alias: 'testLocale'
      }
    }
    const l10n = new L10nService(app)
    await l10n.register()
    l10n.registerLocales(testLocales)

    expect(l10n.get('fi', 'testAlias')).to.eql(l10n.get('fi', 'testLocale'))
  })

  it('should not register an alias to an undefined locale', async () => {
    const l10n = new L10nService(app)
    await l10n.register()
    l10n.registerLocales({
      undefinedAlias: {
        alias: 'testServicesL10nAliasNotFound'
      }
    })

    expect(l10n.get('fi', 'undefinedAlias')).to.eql('undefinedAlias')
  })

  it('should load a locale file with suffix', async () => {
    const testFile = path.join(__dirname, '..', '..', 'resources', 'services', 'l10n', 'load-with-suffix.yml')
    const l10n = new L10nService(app)
    await l10n.register()
    l10n.loadLocales(testFile)
    expect(l10n.get('en', 'loadWithSuffix')).to.eql('Load with suffix')
  })

  it('should add .yml suffix when omitted', async () => {
    const testFile = 'load-without-suffix'

    app.config.set('services.l10n.path', path.join(__dirname, '..', '..', 'resources', 'services', 'l10n'))
    const l10n = new L10nService(app)
    await l10n.register()
    l10n.loadLocales(testFile)
    expect(l10n.get('en', 'loadWithoutSuffix')).to.eql('Load without suffix')
  })
})
