const express = require('express')
const Logger = require('@adrenalin/logger')

module.exports = (app, options = {}) => {
  const logger = new Logger('routers/locales/list')

  const defaults = {}
  const opts = {
    ...defaults,
    ...options
  }

  logger.log('Registering router with options', opts)

  const router = express.Router()

  router.get(['/', '/:lang'], async (req, res, next) => {
    const locales = app.services.l10n.getLocales(req.params.lang)

    res.locals.data.LocalesStore = {
      locales
    }
    next()
  })

  return router
}
