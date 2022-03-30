const express = require('express')
const Logger = require('@adrenalin/logger')
const { buildUrl } = require('@adrenalin/helpers.js')
const Metadata = require('../../client/lib/metadata')

module.exports = (app, options = {}) => {
  const logger = new Logger('@adrenalin/react-server/routers/application/metadata')
  logger.setLevel(3)

  const defaults = {}
  const opts = {
    ...defaults,
    ...options
  }
  logger.log('Registering router with options', opts)

  const router = express.Router()

  const getRequestInfo = (req) => {
    const parts = req.get('host').split(':')
    const host = parts[0]
    const port = Number(req.get('port') || parts[1])

    return {
      port,
      host,
      protocol: port === 443 ? 'https' : 'http'
    }
  }

  router.use((req, res, next) => {
    res.metadata = new Metadata()
    const { host, port, protocol } = getRequestInfo(req)

    const siteUrl = buildUrl({
      host,
      port,
      protocol
    })

    const fullUrl = buildUrl({
      host,
      port,
      protocol,
      location: req.originalUrl
    })

    res.metadata.set('http', 'url', req.originalUrl)
    res.metadata.set('http', 'port', port)
    res.metadata.set('http', 'host', host)
    res.metadata.set('http', 'protocol', protocol)
    res.metadata.set('http', 'siteUrl', siteUrl)
    res.metadata.set('http', 'fullUrl', fullUrl)

    next()
  })

  return router
}
