const Logger = require('@adrenalin/logger')
const express = require('express')
const { merge } = require('@adrenalin/helpers.js')

/* istanbul ignore next */
module.exports = (app, options = {}) => {
  const router = express.Router()
  const logger = new Logger('/routers/application/entry')
  logger.setLevel(3)

  const defaults = {
    statusCode: 302
  }

  /* istanbul ignore next */
  const opts = merge(defaults, options || {})

  /**
   * Determine the user language by the accepted language header
   *
   * @param { request } req           HTTP request
   * @return { string }               Priority language
   */
  const determineLanguage = (req) => {
    const languages = req.config.get('application.languages', [])
    const defaultLang = req.config.get('application.defaultLanguage', languages[0])

    const accepted = req.headers['accept-language']

    if (!accepted) {
      return defaultLang
    }

    const userLanguages = []

    accepted
      .replace(/;q=0\.[0-9]+/g, '') // eslint-disable-line
      .split(',').forEach((lang) => {
        userLanguages.push(lang)
      })

    for (let i = 0; i < userLanguages.length; i++) {
      const lang = userLanguages[i]

      if (languages.includes(lang)) {
        return lang
      }
    }

    return defaultLang
  }

  const resolveLanguage = (req, res, next) => {
    const lang = determineLanguage(req)
    res.redirect(opts.statusCode, `./${lang}`)
  }

  router.get('/', resolveLanguage)
  return router
}
