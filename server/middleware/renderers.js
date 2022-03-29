const path = require('path')
const Logger = require('@adrenalin/logger')

module.exports = async (app) => {
  const logger = new Logger('server/middleware/renderers')
  logger.log('Initializing renderers')

  app.renderers = {}
  const renderers = app.config.get('middleware.renderers') || {}

  for (const engine in renderers) {
    const e = renderers[engine]

    if (!e.enabled) {
      continue
    }

    const r = app.renderers[engine] = {
      engine,
      module: e.module,
      path: path.join(app.APPLICATION_ROOT, e.path || 'views'),
      renderer: require(e.module)
    }

    app.set('view engine', engine)
    app.set('views', r.path)
    app.engine('html', r.renderer)
  }

  return app
}
