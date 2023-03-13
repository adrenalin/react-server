const Service = require('./')
const { getRandomString, parseTemporal } = require('@vapaaradikaali/helpers.js')
const { InternalServerError } = require('@vapaaradikaali/errors')

/**
 * Worker error baseclass
 *
 * @class WorkerError
 */
class WorkerError extends InternalServerError {}

/**
 * Worker error for when the worker does not resolve within the given time
 *
 * @class WorkerError
 */
class WorkerUnresolved extends WorkerError {}

/**
* Worker error for when the worker throws an error
 *
 * @class WorkerError
 */
class WorkerReject extends WorkerError {}

/**
 * Worker service
 *
 * @class WorkerService
 */
module.exports = class WorkerService extends Service {
  /**
   * @const { string } WorkerService.SERVICE_NAME
   */
  static get SERVICE_NAME () {
    return 'worker'
  }

  /**
   * @const { object } WorkerService.errors
   */
  static get errors () {
    return {
      WorkerError,
      WorkerUnresolved,
      WorkerReject
    }
  }

  /**
   * @const { number } WorkerService.LOG_LEVEL
   */
  static get LOG_LEVEL () {
    return 3
  }

  /**
   * Register worker service
   *
   * @method WorkerService#register
   */
  async register () {
    this.worker = require('../lib/worker')
    this.actions = {}

    this.worker.on('message', (message) => {
      const { id, err, response } = message
      this.logger.log('Received from worker', id, err, response)
      const promise = this.actions[id]

      if (!promise) {
        return
      }

      if (this.actions[id].timeout) {
        clearTimeout(this.actions[id].timeout)
      }

      delete this.actions[id]

      if (err) {
        const error = new WorkerReject(err.message)
        error.response = err
        return promise.reject(error)
      }

      promise.resolve(response)
    })
  }

  /**
   * Do an action
   *
   * @method WorkerService#do
   * @param { string } action         Action to do
   * @param { mixed[] } args          Action arguments
   * @return { Promise }              Resolves with action or rejects with an error
   */
  do (action, options, ...args) {
    options = options || {}

    const id = getRandomString(16)
    const promise = new Promise((resolve, reject) => {
      this.actions[id] = {
        resolve,
        reject,
        createdAt: Date.now()
      }

      this.worker.postMessage({ action, options, args, id })
    })

    this.actions[id].promise = promise

    // Clear unresolved workers
    if (options.timeout) {
      const timeout = !isNaN(options.timeout) ? parseFloat(options.timeout) : parseTemporal(options.timeout)

      this.actions[id].timeout = setTimeout(() => {
        if (!this.actions[id]) {
          return
        }

        this.actions[id].reject(new WorkerUnresolved(`Worker failed to resolve within ${timeout} seconds`))
        delete this.actions[id]
      }, timeout * 1000)
    }

    return promise
  }
}
