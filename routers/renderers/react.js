// Local components
const Logger = require('@adrenalin/logger')

module.exports = (app) => {
  const logger = new Logger('@adrenalin/react-server/routers/renderers/react')
  logger.setLevel(3)
  const { renderReactRequest } = require('./helpers')(app)

  return (req, res, next) => {
    renderReactRequest(null, req, res, next)
  }
}
