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
  if (action === 'log_level') {
    logger.setLevel(args[0])
    return args[0]
  }

  if (action === 'echo') {
    setInterval(() => {
      console.log('ping')
    }, 1000)
    return [options, ...args]
  }

  if (action === 'pid') {
    return process.pid
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
    parentPort.postMessage({ id, response, options })
  } catch (err) {
    logger.error(err.message)
    logger.info(err.stack)
    parentPort.postMessage({ id, err, options })
  }
})
