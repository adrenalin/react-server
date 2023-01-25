const express = require('express')
const Logger = require('@vapaaradikaali/logger')
const { setValue } = require('@vapaaradikaali/helpers.js')

module.exports = (app) => {
  const logger = new Logger('@adrenalin/react-server/routers/locales/render')
  logger.log('Registering router')

  const router = express.Router()
  const byLang = {}

  const stored = app.services.l10n.getLocales()

  for (const locale in stored) {
    const translations = Object.keys(stored[locale])

    translations.forEach((lang) => {
      setValue(byLang, `${lang}.${locale}.${lang}`, stored[locale][lang])
    })
  }

  router.use(async (req, res, next) => {
    const lang = req.lang || req.config.get('application.defaultLanguage')
    const locales = byLang[lang] || {}

    setValue(res, 'locals.data.LocalesStore', { locales })
    next()
  })

  return router
}
