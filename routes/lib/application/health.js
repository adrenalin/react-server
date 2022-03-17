const Logger = require('@adrenalin/logger')
const express = require('express')
const Moment = require('moment')

module.exports = (app) => {
  const logger = new Logger('/routes/lib/application/health')
  logger.setLevel(3)

  const router = express.Router()
  const start = new Moment()

  router.get('/', async (req, res, next) => {
    try {
      const now = new Moment()
      const td = Moment.utc(Moment.duration(now.diff(start)))

      res.json({
        status: 'ok',
        started: start.toISOString(true),
        uptime: td.format('HH:mm:ss')
      })
    } catch (err) {
      res.status(500).json({
        status: 'error',
        message: err.message
      })
    }
  })

  return router
}
