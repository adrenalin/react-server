const express = require('express')
const Moment = require('moment')
const { setValue } = require('@adrenalin/helpers.js')
const Logger = require('@adrenalin/logger')

module.exports = (app) => {
  const logger = new Logger('/routers/application/health')
  logger.setLevel(3)

  const router = express.Router()
  const start = new Moment()

  router.get('/', async (req, res, next) => {
    const now = new Moment()
    const td = Moment.utc(Moment.duration(now.diff(start)))

    const health = {
      status: 'ok',
      started: start.toISOString(true),
      uptime: td.format('HH:mm:ss')
    }

    setValue(res, 'locals.data.HealthStore', health)
    next()
  })

  return router
}
