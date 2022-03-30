const Logger = require('@adrenalin/logger')
const express = require('express')
const { castToArray, setValue, Config } = require('@adrenalin/helpers.js')

module.exports = (app) => {
  const router = express.Router()
  const logger = new Logger('@adrenalin/react-server/routers/application/config')
  logger.setLevel(3)

  const initResponseConfig = (req, res) => {
    req.config = new Config()
    req.config.set(app.config.get('react'))

    const host = req.get('host')
    const sites = app.config.get('sites', {})

    for (const domain in sites) {
      const hosts = castToArray(app.config.get(`sites.${domain}.hosts`))

      if (hosts.includes(host)) {
        req.config.set(app.config.get(`sites.${domain}`, {}))
        break
      }
    }

    setValue(res, 'locals.data.ApplicationStore.config', req.config.get('application'))
  }

  router.use((req, res, next) => {
    initResponseConfig(req, res)
    next()
  })

  return router
}
