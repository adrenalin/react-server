const Logger = require('@vapaaradikaali/logger')
const router = require('express')()
const { getValue, Localization } = require('@vapaaradikaali/helpers.js')

function getLangMatches (req) {
  const parts = req.url
    .replace(/(?!:\/)\?/, '/?')
    .replace(/^\//, '')
    .split('/')

  const matches = []

  if (parts[0]) {
    matches.push(parts[0])
  }

  const paths = [
    'session.user.lang',
    'query.lang'
  ]

  paths.forEach((p) => {
    const match = getValue(req, p)

    if (match) {
      matches.push(match)
    }
  })

  return matches
}

function libRoutersApplicationLang (app) {
  const logger = new Logger('@adrenalin/react-server/routers/application/lang')
  logger.setLevel(3)

  router.use(async (req, res, next) => {
    const langs = req.config.get('application.languages', [])

    const matches = getLangMatches(req)
      .filter(lang => lang && langs.includes(lang))

    matches.push(req.config.get('application.defaultLanguage'))

    req.lang = matches[0]
    req.l10n = new Localization()
    req.l10n.setLang(req.lang)

    next()
  })

  return router
}

libRoutersApplicationLang.getLangMatches = getLangMatches
module.exports = libRoutersApplicationLang