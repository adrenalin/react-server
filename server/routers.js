const fs = require('fs')
const path = require('path')
const listFilesSync = require('../lib/helpers/listFilesSync')
const Logger = require('@adrenalin/logger')

module.exports = async (app) => {
  const logger = new Logger('Routes')
  logger.setLevel(4)
  logger.log('Load routes')

  // Read project routes
  const routerFiles = []
  const routers = []

  // Always populate data
  app.use((req, res, next) => {
    res.locals.data = res.locals.data || {}
    next()
  })

  app.use((err, req, res, next) => {
    res.locals.data = res.locals.data || {}
    next(err)
  })

  const routerEnvironments = [
    path.join(app.APPLICATION_ROOT, 'routes', app.environment || 'public')
  ]

  logger.debug('Router environments', routerEnvironments)

  routerEnvironments.forEach((env) => {
    try {
      if (!fs.existsSync(env)) {
        return
      }

      listFilesSync(env, ['.js']).forEach((filename) => {
        routerFiles.push(filename)
      })
    } catch (err) {
      logger.error('Failed to load paths', err)
    }
  })

  routerFiles.forEach((filename) => {
    try {
      logger.debug('Loading routers from file', filename)
      const router = require(filename)
      logger.log('Got router', filename)

      if (!router || typeof router.registerRouter !== 'function') {
        logger.log('Router file does not register any routers', filename)
        return null
      }

      router.priority = router.priority || 0
      router.path = filename
      routers.push(router)
    } catch (err) {
      logger.error('Failed to require the route', filename, err.stack)
    }
  })

  routers.sort((a, b) => {
    if (a.priority > b.priority) {
      return -1
    }

    if (a.priority < b.priority) {
      return 1
    }

    return 0
  })

  for (let i = 0; i < routers.length; i++) {
    try {
      const router = routers[i]

      const start = Date.now()
      await router.registerRouter(app)
      const dt = Date.now() - start
      logger.log('Loaded router', router.path, 'in', dt, 'ms')
    } catch (err) {
      logger.error(err.message)
    }
  }
}
