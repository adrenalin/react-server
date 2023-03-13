const Service = require('./')
const { getRandomString } = require('@vapaaradikaali/helpers.js')
const { InternalServerError } = require('@vapaaradikaali/errors')

class WorkerError extends InternalServerError {}

module.exports = class WorkerService extends Service {
  static get SERVICE_NAME () {
    return 'worker'
  }

  static get errors () {
    return {
      WorkerError
    }
  }

  static get LOG_LEVEL () {
    return 3
  }

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

      delete this.actions[id]

      if (err) {
        const error = new WorkerError(err.message)
        error.response = err
        return promise.reject(error)
      }

      promise.resolve(response)
    })
  }

  /**
   * Do an action
   *
   * @param { string } action         Action to do
   * @param { mixed[] } args          Action arguments
   * @return { Promise }              Resolves with action or rejects with an error
   */
  do (action, options, ...args) {
    const id = getRandomString(16)
    const promise = new Promise((resolve, reject) => {
      this.actions[id] = {
        promise,
        resolve,
        reject,
        createdAt: Date.now()
      }

      this.worker.postMessage({ action, options, args, id })
    })

    return promise
  }
}
