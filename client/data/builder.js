import { merge } from '../lib/helpers'
import request from '../lib/request'

function generateMethod (name, definition, sourceBase) {
  const methodDefinition = {
    local: function local () {
      return null
    },
    success: null,
    error: sourceBase.actions.error,
    loading: sourceBase.actions.base[name]
  }

  if (!definition.actions || !definition.actions.success) {
    throw new Error(`no actions.success defined for "${name}" in ${definition.name}`)
  }

  ['success', 'loading', 'error'].forEach((key) => {
    if (definition.actions[key]) {
      methodDefinition[key] = definition.actions[key]
    }
  })

  const remoteDefinition = merge({
    method: 'get',
    response: {
      key: 'items'
    }
  }, definition.remote || {})
  remoteDefinition.method = String(remoteDefinition.method).toLowerCase()
  remoteDefinition.response = definition.remote.response

  if (['put', 'post', 'patch', 'get', 'delete', 'trace', 'options', 'connect', 'head'].indexOf(remoteDefinition.method) === -1) {
    throw new Error(`Invalid method "${remoteDefinition.method}"`)
  }

  if (typeof definition.remote.response === 'function') {
    remoteDefinition.response = definition.remote.response
  }

  if (!remoteDefinition.uri) {
    throw new Error(`no uri defined for method "${name}"`)
  }

  methodDefinition.remote = function (state, ...args) {
    const uri = typeof remoteDefinition.uri === 'function' ? remoteDefinition.uri(state, args) : remoteDefinition.uri

    let params = {}
    if (remoteDefinition.params) {
      params = remoteDefinition.params
      if (typeof params === 'function') {
        params = params(state, args)
      }
    }

    const opts = {
      method: remoteDefinition.method.toUpperCase(),
      url: uri,
      data: params,
      headers: merge({
        'X-Cache-Refresh': Date.now(),
        'Pragma': 'no-cache', // eslint-disable-line quote-props
        'Cache-Control': 'no-cache'
      }, remoteDefinition.headers || {})
    }

    let lifetime = remoteDefinition.cache

    if (typeof window !== 'undefined') {
      if (window.localStorage.getItem('no-cache')) {
        lifetime = 0
      }
    }

    return request(opts)
      .then((response) => {
      // this.debug(`${name} success response:`, response)

        if (!response.data) {
        // this.debug('no data')
          return Promise.reject(new Error('invalid response, no data'))
        }

        if (window.location.hostname === 'localhost' && lifetime && response.cached) {
          console.warn('Got cached value for', opts.url)
        }

        if (typeof remoteDefinition.response === 'function') {
        // this.debug('has response function')
          return remoteDefinition.response(state, response, args)
        }

        const responseKey = remoteDefinition.response.key
        const resolveData = responseKey ? response.data[responseKey] : response.data

        if (!resolveData) {
          if (remoteDefinition.errorHandler) {
            const err = new Error('Invalid response')
            err.options = opts
            return remoteDefinition.errorHandler(err)
          }

          console.error('Invalid response, no data found for response key', responseKey)
          console.error('Received data', response.data)

          return Promise.reject(new Error(`Invalid response, missing response key "${responseKey}"`))
        }

        return Promise.resolve(resolveData)
      })
      .catch((response) => {
        if (remoteDefinition.errorHandler) {
          response.options = opts
          return remoteDefinition.errorHandler(response)
        }

        if (response instanceof Error) {
        // this.debug('is instanceof Error')
          return Promise.reject(response)
        }

        const msg = response.data && response.data.error ? response.data.error : 'unexpected error'
        // this.debug('Reject as error', msg)
        return Promise.reject(new Error(msg))
      })
  }
  // .bind(sourceBase)

  if (typeof definition.local === 'function') {
    methodDefinition.local = definition.local.bind(sourceBase)
  }

  return function () {
    return methodDefinition
  }
}

export default {
  build: function BuildSource (structure) {
    if (!structure.name) {
      throw new Error('no name defined for Source')
    }

    if (!structure.actions || !structure.actions.base) {
      throw new Error('no actions.base defined for Source')
    }

    structure.methods = structure.methods || []

    if (!structure.actions.error) {
      structure.actions.error = structure.actions.base.requestFailed
    }

    const base = {
      debug: require('debug')(structure.name),
      actions: structure.actions
    }

    const source = {}

    for (const name in structure.methods) {
      const definition = structure.methods[name]
      source[name] = generateMethod(name, definition, base)
    }

    return source
  }
}
