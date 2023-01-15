const Logger = require('@vapaaradikaali/logger')
const { BadRequest, InvalidArgument, MethodNotAllowed } = require('@vapaaradikaali/errors')
const { castToArray, getValue, isObject } = require('@vapaaradikaali/helpers.js')
const request = require('../request')

const cached = {}

class Source {}

/**
 * Build source
 *
 * @function builder.buildSource
 * @param { string|object } name      Source name or options with name, actions and methods
 * @param { object } [actions]        Source actions
 * @param { object } [methods]        Source methods
 * @param { object } [options]        Source options
 * @return { Source }                 Source
 */
function buildSource (name, actions, methods, options) {
  options = options || {}

  if (isObject(name)) {
    actions = name.actions
    methods = name.methods || {}

    for (const key in name) {
      if (['actions', 'methods', 'name'].includes(key)) {
        continue
      }

      options[key] = name[key]
    }

    name = name.name
  }

  if (!name) {
    throw new InvalidArgument('No "name" defined for source')
  }

  if (!actions || !Object.keys(actions).length) {
    throw new InvalidArgument(`No "actions" defined for source "${name}"`)
  }

  const className = name.replace(/(Source)?$/, 'Source')
  const logger = new Logger(className)
  logger.setLevel(3)

  if (cached[name]) {
    logger.log('Use cached source for', name)
    return cached[name]
  }

  methods = methods || {}
  const responseKeys = new Set()

  /**
   * @class Source
   */
  class ExtendedSource extends Source {
    static get name () {
      return className
    }

    static get actions () {
      return actions
    }

    static get responseKeys () {
      return responseKeys
    }

    constructor (actions, methods, options) {
      super()
      logger.log('Create source', className)
      this.onError = actions.requestFailed

      for (const name in methods) {
        logger.log('Set method', name)
        this[name] = this.generateMethod(name, methods[name]).bind(this)
        logger.debug('Method set', name)
      }

      this.listeners = {}
      this.publicMethods = {}
    }

    /**
     * Get action
     *
     * @param { string|string[]|function } needle   Action to search
     * @param { object } options                    Source options
     * @param { Function } defaultValue             Default value if needle was not found
     * @return { Function }                         Matching action
     */
    getAction (needle, options, defaultValue) {
      if (needle instanceof Function) {
        return needle
      }

      needle = castToArray(needle)

      for (const n of needle) {
        if (actions[n] instanceof Function) {
          return actions[n]
        }
      }

      if (!defaultValue) {
        throw new InvalidArgument(`Action "${needle.join('", "')}" is not a function`)
      }

      return defaultValue
    }

    /**
     * Generate method
     *
     * @param { string } name           Method name
     * @param { object } options        Method options
     */
    generateMethod (name, options) {
      logger.log('generateMethod', name)

      const keys = castToArray(getValue(options, ['key', 'keys'], 'item'))

      keys.forEach(k => responseKeys.add(k))

      // Backwards compatibility for remote as an option
      const remote = options.remote || options

      const opts = {
        keys,
        response: remote.response,
        local: options.local,

        // Bind actions
        loading: this.getAction(options.loading || name, options),
        success: this.getAction(options.success, options),
        error: this.getAction('error', options, this.onError)
      }

      remote.method = (remote.method || 'get').toUpperCase()

      if (!['CONNECT', 'DELETE', 'GET', 'HEAD', 'OPTIONS', 'PATCH', 'POST', 'PUT', 'TRACE'].includes(remote.method)) {
        throw new MethodNotAllowed(`Method "${name}" has an invalid request method "${remote.method}"`)
      }

      opts.remote = async (state, ...args) => {
        logger.log('Remote method called with state', state, 'and args', ...args)
        try {
          const url = remote.uri instanceof Function ? remote.uri(state, ...args) : remote.uri
          logger.debug('Doing a request to', url)

          const response = await request({
            method: remote.method,
            url,
            data: remote.params instanceof Function ? remote.params(state, ...args) : remote.params,
            headers: remote.headers || {}
          })

          logger.log('Received response with body containing keys', Object.keys(response.data))
          logger.debug('Full response', response)

          if (opts.response instanceof Function) {
            logger.debug('Response handler is a function, calling it with response, state and args')
            return opts.response(response, state, ...args)
          }

          const data = {}

          keys.forEach((key) => {
            logger.debug('Check for key', key, 'from response data')

            if (response.data[key] === undefined) {
              throw new BadRequest(`Key "${key}" missing from response`)
            }

            data[key] = response.data[key]
          })

          logger.info('Received a valid response from', url, 'with status', response.status)
          logger.debug('Will return data', data)
          return data
        } catch (err) {
          logger.error('Caught error', err)
          this.onError(err)
          throw err
        }
      }

      opts.remote.bind(this)

      const method = function request () {
        this.name = name
        this.keys = keys
        return opts
      }

      return method
    }
  }

  cached[name] = new ExtendedSource(actions, methods, options)
  return cached[name]
}

buildSource.Source = Source

module.exports = buildSource
