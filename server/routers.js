const fs = require('fs')
const errors = require('@adrenalin/errors')
const Logger = require('@adrenalin/logger')
const { castToArray } = require('@adrenalin/helpers.js')
const path = require('path')
const listFilesSync = require('../lib/helpers/listFilesSync')

module.exports = async (app) => {
  const logger = new Logger('Routes')
  logger.setLevel(4)
  logger.log('Load routes')

  if (!app.config.get('routers.enabled')) {
    return app
  }

  app.routers = []

  // Read project routes
  const routerFiles = []
  const routers = []

  // Always populate data
  app.use((req, res, next) => {
    res.locals.data = res.locals.data || {}
    next()
  })

  const routerEnvironments = castToArray(app.config.get(['routers.paths', 'routers.path']) || path.join(app.APPLICATION_ROOT, 'routers', app.environment || 'public'))
  routerEnvironments.push(path.join(app.APPLICATION_ROOT, 'routers', 'shared'))

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
      throw new errors.InternalServerError(`Failed to load path "${env}"`)
    }
  })

  routerFiles.forEach((filename) => {
    try {
      logger.debug('Loading routers from file', filename)
      const router = require(filename)
      logger.log('Got router', filename)

      if (typeof router === 'function') {
        routers.push({
          priority: 0,
          path: filename,
          registerRouter: router
        })
      }

      if (!router || typeof router.registerRouter !== 'function') {
        logger.log('Router file does not register any routers', filename)
        return null
      }

      router.priority = router.priority || 0
      router.path = filename
      routers.push(router)
    } catch (err) {
      logger.error('Failed to require the route', filename, err.stack)
      throw new errors.InternalServerError(`Failed to require the route "${filename}"`)
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
      throw new errors.InternalServerError(`Failed to require router "${routers[i].path}"`)
    }
  }
}
