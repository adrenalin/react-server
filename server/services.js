const path = require('path')
const Logger = require('@adrenalin/logger')
const { castToArray, getValue } = require('@adrenalin/helpers.js')
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

  app.services = app.services || {}

  logger.debug('Service files', serviceFiles)

  const classes = {}

  for (let i = 0; i < serviceFiles.length; i++) {
    const filename = serviceFiles[i]
    const ServiceClass = require(filename)

    // Skip the baseclass
    if (ServiceClass.constructor === Service) {
      continue
    }

    const name = ServiceClass.SERVICE_NAME || ServiceClass.name.toLowerCase().replace(/service$/, '')
    classes[name] = ServiceClass
  }

  const services = app.config.get('services') || {}

  for (const key in services) {
    const configured = castToArray(getValue(services, key))

    for (let i = 0; i < configured.length; i++) {
      const config = configured[i] || {}

      const name = getValue(config, 'service', key)

      if (!config.enabled) {
        continue
      }

      const service = new classes[name](app)
      await service.register()

      const registerTo = [
        key,
        getValue(config, 'alias')
      ]

      registerTo
        .filter(k => k)
        .forEach((k) => {
          app.services[k] = service
          logger.log('Registered service', name, 'as', k)
        })
    }
  }
}
