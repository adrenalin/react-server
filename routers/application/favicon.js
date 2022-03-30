const fs = require('fs')
const path = require('path')
const express = require('express')
const errors = require('@adrenalin/errors')
const Logger = require('@adrenalin/logger')

module.exports = (app) => {
  const logger = new Logger('@adrenalin/react-server/routers/application/favicon')
  logger.setLevel(3)

  const router = express.Router()
  router.get('/favicon.ico', (req, res, next) => {
    try {
      const faviconPath = path.join(app.STATIC_ROOT, req.config.get('favicon'))

      if (!fs.existsSync(faviconPath)) {
        return next(new errors.NotFound('pageNotFound'))
      }

      res.sendFile(faviconPath)
    } catch (err) {
      /* istanbul ignore next */
      logger.error(err)

      /* istanbul ignore next */
      next(err)
    }
  })

  return router
}
