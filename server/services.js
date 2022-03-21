const path = require('path')
const Logger = require('@adrenalin/logger')
const listFilesSync = require('../lib/helpers/listFilesSync')
const Service = require('../services')

module.exports = async (app) => {
  const logger = new Logger('Services')
  logger.setLevel(5)
  // Read project services
  const serviceFiles = listFilesSync(path.join(__dirname, '..', 'services'), ['.js'])

  app.services = app.services || {}

  logger.debug('Service files', serviceFiles)

  for (let i = 0; i < serviceFiles.length; i++) {
    const filename = serviceFiles[i]
    const ServiceClass = require(filename)

    const name = ServiceClass.SERVICE_NAME || ServiceClass.name.toLowerCase().replace(/service$/, '')

    if (!app.config.get(`services.${name}.enabled`)) {
      continue
    }

    const service = new ServiceClass(app)
    await service.register()

    // Skip the baseclass
    if (ServiceClass.constructor === Service) {
      continue
    }

    app.services[name] = service
    logger.log('Registered service', name)
  }
}
