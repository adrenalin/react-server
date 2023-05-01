const path = require('path')
const Logger = require('@vapaaradikaali/logger')
const logger = new Logger('lib/helpers/applyHook')
logger.setLevel(3)

/**
 * Gracefully apply an initialization hook if one exists
 *
 * @param { object } app              Express application
 * @param { string } hookName         Hook name
 */
module.exports = async function applyHook (app, hookName) {
  try {
    if (!app || !app.APPLICATION_ROOT) {
      return null
    }

    logger.debug('Will try to apply hook', hookName)
    const p = path.join(app.APPLICATION_ROOT, 'server', hookName)
    console.log('include path', p)
    const hook = require(p)
    logger.log('Applying hook', hookName)
    const rval = await hook(app)
    logger.log('Hook', hookName, 'applied')
    return rval
  } catch (err) {
    if (['MODULE_NOT_FOUND'].includes(err.code)) {
      logger.log('No hook', hookName, 'found')
      return
    }

    logger.error('Hook', hookName, 'failed')
    logger.error(err)
    throw err
  }
}
