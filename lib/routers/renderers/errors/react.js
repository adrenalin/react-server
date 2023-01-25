// Local components
const Logger = require('@vapaaradikaali/logger')

module.exports = (app) => {
  const logger = new Logger('@adrenalin/react-server/routers/renderers/errors/react')
  logger.setLevel(3)
  const { renderReactRequest } = require('../helpers')(app)

  return (err, req, res, next) => {
    renderReactRequest(err, req, res, next)
  }
}
