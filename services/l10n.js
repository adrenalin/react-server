const fs = require('fs')
const path = require('path')
const YAML = require('yaml')
const Service = require('./')
const listFilesSync = require('../lib/helpers/listFilesSync')

const registered = {}

module.exports = class LocalizationService extends Service {
  static get LOG_LEVEL () {
    return 3
  }

  static get SERVICE_NAME () {
    return 'l10n'
  }

  async register () {
    const files = listFilesSync(this.getLocalesPath())

    this.l10n = new this.helpers.Localization()
    this.loadLocales(files)
  }

  /**
   * Get locales path
   *
   * @return { string }               Path to the locales root
   */
  getLocalesPath () {
    const p = this.app.config.get('services.l10n.path', path.join(this.app.APPLICATION_ROOT, 'locales'))
    return p.match(/^\//) ? p : path.join(this.app.APPLICATION_ROOT, p)
  }

  /**
   * Get localization instance
   *
   * @return { Localization }         Localization instance
   */
  getInstance () {
    return this.l10n
  }

  /**
   * Get registered locales
   *
   * @param { string } [lang]             Language
   * @param { boolean } [ignorePrivate]   Ignore private locales
   * @return { object }                   Registered locales
   */
  getLocales (lang = null, ignorePrivate = true) {
    const list = {}

    for (const locale in registered) {
      if (ignorePrivate && registered[locale].private) {
        continue
      }
      list[locale] = this.helpers.copyObject(lang ? registered[locale].translations[lang] : registered[locale].translations)
    }

    return list
  }

  /**
   * Get a localized string
   *
   * @param { string } lang           Language
   * @param { mixed } ...args         Rest of the arguments
   */
  get (lang, ...args) {
    return this.l10n.getInLang(lang, ...args)
  }

  /**
   * Register locales
   *
   * @param { object } locales        Locales to register
   * @return { LocalizationService }  This instance
   */
  registerLocales (locales) {
    const aliases = {}

    for (const locale in locales) {
      const d = locales[locale]

      const translations = d.translations || d || {}

      registered[locale] = {
        private: !!d.private,
        context: d.context || null,
        translations
      }

      if (d.alias) {
        aliases[locale] = d.alias
        continue
      }

      this.helpers.Localization.registerLocale(locale, translations)
    }

    for (const locale in aliases) {
      const alias = aliases[locale]

      if (!registered[alias]) {
        this.logger.warn('Could not find the alias', alias, 'for', locale)
        continue
      }

      const translations = registered[locale].translations = registered[alias].translations || {}
      this.helpers.Localization.registerLocale(locale, translations)
    }

    return this
  }

  /**
   * Load locales from a file
   *
   * @param { string|array } filename   Locale files to load
   */
  loadLocales (filename) {
    this.helpers.castToArray(filename).forEach((fn) => {
      try {
        if (fn.match(/^[a-zA-Z0-9\-_]+$/)) {
          this.logger.log(`Bare filename "${fn}" given, add application root and ".yml" suffix`)
          fn = path.join(this.getLocalesPath(), `${fn}.yml`)
          this.logger.debug(`Heuristics defined path is "${fn}"`)
        }

        if (!fn.match(/\.ya?ml$/)) {
          this.logger.log('Skip', fn, 'because it does not have the suffix .yml or .yaml')
          return
        }

        const content = fs.readFileSync(fn, 'utf-8')
        const locales = YAML.parse(content)

        for (const locale in locales) {
          if (registered[locale]) {
            this.logger.log(`Duplicate locale "${locale}" found in "${fn}"`)
          }
        }

        this.registerLocales(locales)
      } catch (err) {
        /* istanbul ignore next error logging */
        this.logger.error('Failed to load locales for', fn, 'due to', err.message)

        /* istanbul ignore next error logging */
        this.logger.error(err.stack)

        /* istanbul ignore next rethrowing an error */
        throw err
      }
    })
  }
}
