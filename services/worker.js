const path = require('path')
const { Worker } = require('node:worker_threads')
const { getRandomString, parseTemporal } = require('@vapaaradikaali/helpers.js')
const { InternalServerError } = require('@vapaaradikaali/errors')
const Service = require('./')

const workers = []
let roundRobin = 0

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

  static get WORKERS () {
    return workers
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
   * @return { WorkerService }        This instance
   */
  async register () {
    if (this.worker) {
      return
    }

    if (this.config.get('services.worker.maxThreadSize') === this.constructor.WORKERS.length) {
      this.worker = this.constructor.WORKERS[roundRobin]
      roundRobin = roundRobin >= this.config.get('services.worker.maxThreadSize') ? 0 : roundRobin + 1
      return this
    }

    this.worker = new Worker(path.join(__dirname, '..', 'lib', 'worker'))
    this.actions = {}

    this.worker.on('message', (message) => {
      const { id, err, response } = message
      this.logger.log('Received from worker', id, err, response)
      const promise = this.actions[id]

      /* istanbul ignore if possibly untestable due to earlier failsafes */
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

    this.constructor.WORKERS.push(this.worker)
    return this
  }

  /**
   * Do an action
   *
   * @method WorkerService#do
   * @param { string } action         Action to do
   * @param { mixed[] } args          Action arguments
   * @return { Promise }              Resolves with action or rejects with an error
   */
  async do (action, options, ...args) {
    if (!this.worker) {
      await this.register()
    }

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

  /**
   * Set log level
   *
   * @method WorkerService#setLogLevel
   * @return { number }               Current log level
   */
  async setLogLevel (level) {
    return this.do('log_level', null, 0)
  }

  /**
   * Get worker process id
   *
   * @method WorkerService#getPid
   * @return { number }               Worker PID
   */
  async getPid () {
    return this.do('pid')
  }

  /**
   * Kill a worker
   *
   * @method WorkerService#kill
   * @return { WorkerService }        This instance
   */
  async kill () {
    if (!this.worker) {
      return this
    }

    const indexOf = this.constructor.WORKERS.indexOf(this.worker)
    this.constructor.WORKERS.slice(indexOf, 1)

    await this.worker.terminate()
    delete this.worker
    return this
  }
}
