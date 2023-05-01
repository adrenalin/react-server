const { MethodNotAllowed } = require('@vapaaradikaali/errors')
module.exports = async function throwsError(app) {
  throw new MethodNotAllowed('Not allowed')
}