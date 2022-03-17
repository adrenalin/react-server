const request = require('./request')
const { typecastString } = require('@adrenalin/helpers.js')

exports.getFullPath = function getFullPath (obj) {
  let host = `${obj.ssl ? 'https' : 'http'}://${obj.host}`

  if ((obj.ssl && obj.port !== 443) || (!obj.ssl && obj.port !== 80)) {
    host += `:${obj.port}`
  }

  return host
}

exports.merge = function merge (...argv) {
  const target = Object.assign({}, argv.shift())

  argv.forEach((a) => {
    try {
      for (const key in a) {
        const value = a[key]
        if (a.hasOwnProperty(key)) { // eslint-disable-line no-prototype-builtins
          if (Array.isArray(target[key])) {
            target[key] = target[key].concat(value)
            continue
          }

          if (typeof target[key] === 'object' && typeof target[key] !== 'undefined' && target[key] !== null) {
            target[key] = merge(target[key], value)
            continue
          }

          target[key] = value
        }
      }
    } catch (err) {
      console.error('Could not merge', ...argv)
    }
  })

  return target
}

exports.calculateReferenceHash = (id) => {
  let s = 0

  id = (String(id).replace(/[^0-9]+/g, '').replace(/^0+/, '') || '').split('').reverse().join('')

  for (let i = 0; i < id.length; i++) {
    const p = Number(id.substr(i, 1))

    switch (i % 3) {
      case 0:
        s += 7 * p
        break
      case 1:
        s += 3 * p
        break
      case 2:
        s += p
        break
    }
  }

  return (10 - (s % 10)) % 10
}

const getFromLocalStorage = exports.getFromLocalStorage = (path, lifetime) => {
  if (typeof window === 'undefined') {
    return null
  }

  if (typeof window.localStorage === 'undefined') {
    return null
  }

  try {
    const str = window.localStorage.getItem(path)
    const d = JSON.parse(str)

    if (!d) {
      return null
    }

    // Timestamp check
    if (!d.t) {
      return null
    }

    if (d.t < Date.now() - lifetime * 1000) {
      return null
    }

    return d.v
  } catch (err) {
    return null
  }
}

const setToLocalStorage = exports.setToLocalStorage = (path, value, lifetime) => {
  if (!lifetime) {
    return
  }
  try {
    window.localStorage.setItem(path, JSON.stringify({
      t: Date.now(),
      v: value
    }))
  } catch (err) {
    console.info('Failed to cache to localStorage', err)
  }
}

const canUseCache = () => {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return false
  }

  if (Number(window.localStorage.getItem('no-cache'))) {
    console.info('Cache disabled by localStorage key "no-cache"')
    return false
  }

  return true
}

/**
 * Cached request to API
 *
 * @param {string} path       API path
 * @param {number} lifetime   Cache lifetime in seconds
 */
const cachedRequest = exports.cachedRequest = (options, lifetime) => {
  if (typeof options === 'string') {
    options = {
      url: options,
      method: 'get'
    }
  }

  lifetime = Math.max(0, lifetime || 0)

  const path = options.url

  if (options.method.toLowerCase() === 'get' && lifetime && canUseCache()) {
    const cached = getFromLocalStorage(path, lifetime)

    if (cached != null) {
      return Promise.resolve({ data: cached, cached: true })
    }
  }

  return request(options)
    .then((res) => {
      setToLocalStorage(path, res.data, lifetime)
      return Promise.resolve(res)
    })
}

exports.loadCountries = async (lang = 'en') => {
  const res = await cachedRequest(`/api/countries?lang=${lang}`, 60)
  return res.data.countries
}

exports.loadIndustries = async (lang = 'en') => {
  const res = await cachedRequest(`/api/industries?lang=${lang}`, 60)
  return res.data.industries
}

exports.loadESGPreferences = async (lang = 'en') => {
  const res = await cachedRequest('/api/esg/preferences', 60)
  return res.data.preferences
}

exports.intersection = (...args) => {
  const a = args[0]

  if (!Array.isArray(a)) {
    console.error('Trying to get an intersection of a non-array', a)
    throw new Error('Trying to get an intersection of a non-array')
  }

  if (!args[1]) {
    return a
  }

  for (let i = 1; i <= args.length; i++) { // eslint-disable-line no-unreachable-loop
    const b = args[i]

    if (!Array.isArray(b)) {
      this.logger.error('Trying to get an intersection of a non-array', b)
      throw new Error('Trying to get an intersection of a non-array')
    }

    return a.filter((val) => {
      return b.includes(val)
    })
  }
}

const defaultPasswordRequirements = {
  length: 4,
  lowercase: false,
  uppercase: false,
  numeric: false,
  special: false
}

exports.validatePassword = (pw, opts = {}) => {
  opts = opts || {}

  Object.keys(defaultPasswordRequirements).forEach((k) => {
    if (opts[k] == null) {
      opts[k] = defaultPasswordRequirements[k]
    }
  })

  if (pw == null) {
    return { error: 'passwordChangeErrorsNoNewPassword', args: null }
  }

  if (pw.length < opts.length) {
    return { error: 'passwordValidityErrorTooShort', args: [opts.length] }
  }

  if (opts.lowercase && !pw.match(/[a-z]/)) {
    return { error: 'passwordValidityError', args: ['requiredLowerCase'] }
  }

  if (opts.uppercase && !pw.match(/[A-Z]/)) {
    return { error: 'passwordValidityError', args: ['requiredUpperCase'] }
  }

  if (opts.numeric && !pw.match(/[0-9]/)) {
    return { error: 'passwordValidityError', args: ['requiredNumeric'] }
  }

  if (opts.special && pw.match(/^[a-zA-Z0-9]+$/)) {
    return { error: 'passwordValidityError', args: ['requiredSpecialCharacter'] }
  }

  return null
}

const flattenNumericArray = (...args) => {
  const values = []
  args.forEach((value) => {
    if (Array.isArray(value)) {
      value.forEach((v) => {
        values.push(Number(v))
      })
      return
    }

    values.push(Number(value))
  })

  return values.filter((v) => {
    return !(v == null)
  }).sort((a, b) => {
    return (a >= b) ? 1 : -1
  })
}

exports.getMedian = (...values) => {
  const v = flattenNumericArray(...values)

  // No values found, return null
  if (!v.length) {
    return null
  }

  const i = Math.floor((v.length - 1) / 2)

  if (v.length % 2) {
    return v[i]
  }

  return getAverage(v[i], v[i + 1])
}

const getAverage = exports.getAverage = (...values) => {
  const v = flattenNumericArray(...values)

  if (!v.length) {
    return null
  }

  let t = 0
  v.forEach((value) => {
    if (typeof value !== 'number') {
      return
    }

    t += value
  })

  return t / v.length
}

exports.serializer = (tasks, fn) => {
  tasks = tasks.slice()
  let i = 0

  return new Promise((resolve, reject) => {
    const serializer = () => {
      if (!tasks.length) {
        return resolve()
      }

      const task = tasks.splice(0, 1)[0]

      Promise.resolve(fn(task, i++))
        .then(() => {
          serializer()
        })
        .catch((err) => {
          reject(err)
        })
    }

    serializer()
  })
}

exports.queryString = (qs = null) => {
  const q = {}
  if (qs == null && typeof window !== 'undefined') {
    qs = window.location.search
  }

  if (!qs || qs === '?') {
    return q
  }

  const parts = String(qs.replace(/^\?/, '')).split('&')

  parts.forEach((part) => {
    const p = part.split('=')
    const k = p[0]
    const v = p[1]

    if (!k) {
      return
    }

    // Skip arrays at least for now
    if (k.match(/\[/)) {
      return
    }

    if (v == null) {
      q[k] = true
      return
    }

    q[k] = typecastString(v)
  })

  return q
}

exports.isUUID = (str) => {
  return String(str).match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
}
