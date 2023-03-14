const Logger = require('@vapaaradikaali/logger')
const { parentPort } = require('node:worker_threads')

const logger = new Logger('@vapaaradikaali/react-server/lib/workers')
logger.setLevel(3)

/**
 * Execute worker
 *
 * @private
 * @function executeWorker
 * @param { string } action           Worker action
 * @param { object } options          Worker options
 * @param { mixed[] } [args]          Worker arguments
 * @return { mixed }                  Response from the worker
 */
function executeWorker (action, options, args) {
  if (action === 'echo') {
    return [options, ...args]
  }

  if (action === 'execute') {
    if (!options.path) {
      throw new Error('No path given for execute')
    }

    const f = require(options.path)

    if (options.method) {
      return f[options.method](...args)
    }

    return f(...args)
  }

  throw new Error(`Unregistered action "${action}"`)
}

parentPort.on('message', async ({ action, args, id, options }) => {
  try {
    if (!action) {
      logger.error('Got a worker message without an action')
      throw new Error('Got a worker message without an action')
    }

    logger.log('Got an action', action)
    logger.debug('args', args)

    const response = await executeWorker(action, options, args)
    parentPort.postMessage({ id, response })
  } catch (err) {
    logger.error(err.message)
    logger.info(err.stack)
    parentPort.postMessage({ id, err })
  }
})
