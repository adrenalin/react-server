const path = require('path')
const Logger = require('@adrenalin/logger')
const listFilesSync = require('../lib/helpers/listFilesSync')
const Service = require('../services')

module.exports = async (app) => {
  const logger = new Logger('@adrenalin/react-server/server/services')
  logger.setLevel(4)

  const packageRoot = path.join(__dirname, '..', 'services')

  const loadApplicationServices = () => {
    try {
      const root = path.join(app.APPLICATION_ROOT, 'services')
      if (packageRoot === root) {
        return []
      }

      return listFilesSync(root, ['.js'])
    } catch (err) {
      logger.log('Non-fatal error: could not find application services', err.message)
      logger.debug(err.stack)
      return []
    }
  }

  // Read library services
  const systemServices = listFilesSync(packageRoot, ['.js'])

  const serviceFiles = [...systemServices, ...loadApplicationServices()]
  logger.log('Load service files', serviceFiles)

  // @TODO: read project services

  app.services = app.services || {}

  logger.debug('Service files', serviceFiles)

  for (let i = 0; i < serviceFiles.length; i++) {
    const filename = serviceFiles[i]
    const ServiceClass = require(filename)

    // Skip the baseclass
    if (ServiceClass.constructor === Service) {
      continue
    }

    const name = ServiceClass.SERVICE_NAME || ServiceClass.name.toLowerCase().replace(/service$/, '')

    if (!app.config.get(`services.${name}.enabled`)) {
      logger.log('Service', name, 'is not enabled, skipping')
      continue
    }

    const service = new ServiceClass(app)
    await service.register()

    app.services[name] = service
    logger.log('Registered service', name)
  }
}
