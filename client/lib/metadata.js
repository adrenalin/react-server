const Logger = require('@vapaaradikaali/logger')
const { InvalidArgument } = require('@vapaaradikaali/errors')
const { castToArray, getValue, isObject, setValue } = require('@vapaaradikaali/helpers.js')

module.exports = class Metadata {
  /**
   * Helper function to trim strings
   *
   * @param { mixed } value           Value to trim
   * @return { mixed }                Trimmed value if string given, otherwise the original value
   */
  static trim (value) {
    if (typeof value !== 'string') {
      return value
    }

    return value.replace(/(^\s*|\s*$)/g, '')
  }

  /**
   * Alias to the static method
   *
   * @return { function }             Metadata.trim method
   */
  get trim () {
    return this.constructor.trim
  }

  constructor () {
    this.logger = new Logger(this)
    this.logger.setLevel(5)
    this.values = {}
    this.listeners = {}
    this.url = '/'
  }

  /**
   * Bind to metadata object given e.g. in server side renderer
   *
   * @param { object } obj            Object to bind the metadata
   */
  bindTo (obj) {
    if (!isObject(obj)) {
      throw new InvalidArgument('Metadata bindTo accepts only an object as an argument')
    }

    this.values = obj
  }

  /**
   * Flush metadata and return the previous metadata object
   *
   * @return { object }               Copy of the current metadata object
   */
  flush () {
    const values = JSON.parse(JSON.stringify(this.values))

    // Reset the stored metadata values
    this.values = {}

    return values
  }

  /**
   * Object serialization as JSON
   *
   * @return { object }               Metadata
   */
  toJSON () {
    return JSON.parse(JSON.stringify(this.values))
  }

  /**
   * Get current metadata values
   *
   * @return { object }               Current metadata state
   */
  getValues () {
    return this.values
  }

  /**
   ' Set a value to metadata domain
   *
   * @param { string } domain         Name of the metadata domain
   * @param { string|object } key     Metadata key or an object with key-value pairs
   * @param { mixed } [value]         Metadata value
   * @return { Metadata }             This instance
   */
  set (domain, key, value) {
    const originalArgs = [domain, key, value].filter(k => k != null)

    /**
     * Internal helper to parse the given arguments
     */
    const set = (...args) => {
      const [_d, _k, _v] = args

      if (isObject(_d)) {
        for (const k in _d) {
          set(k, _d[k])
        }

        return
      }

      if (isObject(_k)) {
        for (const k in _k) {
          set(_d, k, _k[k])
        }

        return
      }

      if (_d == null || typeof _d !== 'string') {
        this.logger.error('Could not resolve the metadata domain')
        this.logger.error('Arguments used', ...originalArgs)
        throw new InvalidArgument('Could not resolve the metadata domain')
      }

      if (_k == null || typeof _k !== 'string') {
        this.logger.error('Could not resolve the metadata key')
        this.logger.error('Arguments used', ...originalArgs)
        throw new InvalidArgument('Could not resolve the metadata key')
      }

      if (this.get(_d, _k) !== _v) {
        const p = `${_d}.${_k}`
        setValue(this.values, p, _v)
        this.trigger(_d, _k, _v)
      }
    }

    set(domain, key, value)

    return this
  }

  /**
   ' Get a value to metadata domain with key
   *
   * @param { string } domain         Name of the metadata domain
   * @param { string } key            Metadata key
   * @param { mixed } defaultValue    Default value
   * @return { mixed }                Stored metadata value or null
   */
  get (domain, key, defaultValue) {
    return getValue(this.values, `${domain}.${key}`, defaultValue)
  }

  /**
   * Append a value to the metadata
   *
   * @param { string } domain         Metadata domain
   * @param { string } key            Metadata key
   * @param { string } value          Metadata value
   */
  append (domain, key, value) {
    // Ensure that the storage is an array
    const values = castToArray(this.get(domain, key))

    // Ensure unique values
    if (values.includes(value)) {
      return this
    }

    values.push(value)

    this.set(domain, key, values)

    return this
  }

  /**
   * Add image
   *
   * @param { string } src            Image source
   * @return { Metadata }             This instance
   */
  addImage (src) {
    this.opengraph('og:image', src)
    return this
  }

  /**
   ' Shorthand to set an OpenGraph metadata key
   *
   * @param { string|object } key     Opengraph key or an object with key-value pairs
   * @param { mixed } [value]         Opengraph value
   * @return { Metadata }             This instance
   */
  opengraph (key, value) {
    /**
     * Internal helper to parse the given arguments
     *
     * @param { string|object } _k    Opengraph key or an object with key-value pairs
     * @param { mixed } [_v]          Opengraph value
     */
    const set = (_k, _v) => {
      if (isObject(_k)) {
        for (const k in _k) {
          set(k, _k[k])
        }

        return
      }

      if (typeof _k !== 'string') {
        const originalArgs = [key, value].filter(k => k != null)

        this.logger.error('Metadata.opengraph accepts either key and value or an object with key-value pairs')
        this.logger.error('Arguments', ...originalArgs)

        throw new InvalidArgument('Metadata.opengraph accepts either key and value or an object with key-value pairs')
      }

      if (!_k.match(/^[a-z]+:/)) {
        _k = `og:${_k}`
      }

      if (_k === 'og:image') {
        this.append('opengraph', _k, _v)
        return
      }

      this.set('opengraph', _k, _v)
    }

    set(key, value)

    return this
  }

  /**
   ' Set the metadata status code for server side rendering
   *
   * @param { number } code           HTTP/1.1 status code
   * @return { Metadata }             This instance
   */
  setStatusCode (code) {
    if (typeof code !== 'number' || !Number.isInteger(code)) {
      this.logger.error('Got an invalid status code', code)
      throw new InvalidArgument('Got a non-numeric status code')
    }

    if (code < 100 || code >= 600) {
      this.logger.error('Got a status code out of range', code)
      throw new InvalidArgument('Status code out of range')
    }

    this.set('http', 'status', code)
    return this
  }

  /**
   ' Set HTTP location for redirections
   *
   * @param { string } location       HTTP/1.1 status code
   * @return { Metadata }             This instance
   */
  setLocation (location) {
    this.set('http', 'location', location)
    return this
  }

  /**
   ' Set the page title
   *
   * @param { string } title          Page title
   * @return { Metadata }             This instance
   */
  setTitle (title) {
    const parts = castToArray(title)
      .filter(p => p)

    this.set('page', 'title', parts.join(' | '))
    this.opengraph('title', parts.join(' | '))

    if (typeof document !== 'undefined') {
      /* istanbul ignore next browser-only */
      document.title = this.getDocumentTitle()
    }

    return this
  }

  /**
   * Get page title
   */
  getDocumentTitle () {
    const title = [this.get('page', 'title')]
    const siteTitle = this.get('site', 'title')

    if (siteTitle) {
      title.push(siteTitle)
    }

    return title
      .filter(p => p)
      .map(p => typeof p === 'string' ? p : JSON.stringify(p))
      .join(' | ')
  }

  /**
   * Set breadcrumb path
   *
   * @param { array } path            Set breadcrumb path
   * @return { Metadata }             This instance
   */
  setBreadcrumbPath (path) {
    path = castToArray(path)

    // Check that each part is an object with either href or to and label
    path.forEach((p) => {
      if (!isObject(p)) {
        this.logger.error('Breadcrumb path has to consist of objects')
        this.logger.error('Got', p)

        throw new InvalidArgument('Breadcrumb path has to consist of objects')
      }

      if (p.to && p.href) {
        this.logger.error('Breadcrumb path has to consist of objects with either href or to, not both')
        this.logger.error('Got', p)

        throw new InvalidArgument('Breadcrumb path has to consist of objects with either href or to, not both')
      }

      const url = p.to || p.href

      if (!url || !p.label) {
        this.logger.error('Breadcrumb path has to consist of objects with either href or to and label')
        this.logger.error('Got', p)

        throw new InvalidArgument('Breadcrumb path has to consist of objects with either href or to and label')
      }
    })

    this.set('navigation', 'breadcrumb', path)
    return this
  }

  /**
   * Get breadcrumb path
   *
   * @return { array }                Breadcrumb parts
   */
  getBreadcrumbPath () {
    this.logger.debug('getBreadcrumbPath', this.get('navigation', 'breadcrumb'))
    return this.get('navigation', 'breadcrumb') || []
  }

  /**
   * Listen to changes in metadata
   *
   * @param { string } domain         Metadata domain
   * @param { key } domain            Metadata key
   * @param { function } callback     Callback to be triggered when a change occurs
   * @return { Metadata }             This instance
   */
  listen (domain, key, callback) {
    this.listeners[domain] = this.listeners[domain] || {}
    this.listeners[domain][key] = this.listeners[domain][key] || []
    this.listeners[domain][key].push(callback)
    return this
  }

  /**
   * Remove a metadata listener
   *
   * @param { string } domain         Metadata domain
   * @param { key } domain            Metadata key
   * @param { function } [callback]   Callback to be removed
   * @return { Metadata }             This instance
   */
  unlisten (domain, key, callback) {
    const listeners = getValue(this.listeners, `${domain}.${key}`, [])

    if (!callback) {
      listeners.splice(0, listeners.length)
      return this
    }

    // Check if there is a matching listener
    while (listeners.includes(callback)) {
      listeners.splice(listeners.indexOf(callback), 1)
    }

    return this
  }

  /**
   * Trigger metadata listeners
   *
   * @param { string } domain         Metadata domain
   * @param { key } domain            Metadata key
   * @param { function } [callback]   Callback to be removed
   * @return { Metadata }             This instance
   */
  async trigger (domain, key, value) {
    const listeners = getValue(this.listeners, `${domain}.${key}`, [])

    listeners.forEach((callback) => {
      try {
        callback(value)
      } catch (err) {
        this.logger.error('Failed to trigger metadata listener for domain', domain, 'with key', key)
        this.logger.error(err)
      }
    })

    return this
  }

  /**
   * Set page class
   *
   * @param { array|string } className  Page class name
   */
  setPageClass (className) {
    const classes = castToArray(className)
      .filter(c => c)
      .map(c => this.trim(c))

    /* istanbul ignore next jQuery is not loaded */
    if (typeof $ !== 'undefined') {
      $('body').attr('class', classes.join(' '))
    }

    this.set('page', 'className', classes.join(' '))
    return this
  }

  /**
   * Set page type
   *
   * @param { string } type           CreativeWork type as defined in https://schema.org/CreativeWork
   */
  setPageType (type) {
    this.set('page', 'type', this.trim(type))
    return this
  }

  /**
   * Add page class
   *
   * @param { string } className      Page class name
   * @return { Metadata }             This instance
   */
  addPageClass (className) {
    const current = castToArray(this.get('page', 'className', '')
      .split(' '))
      .filter(c => c)

    if (!current.includes(className)) {
      current.push(className)
    }

    this.setPageClass(current)
    return this
  }

  /**
   * Remove page class
   *
   * @param { string } className      Page class name
   * @return { Metadata }             This instance
   */
  removePageClass (className) {
    const current = castToArray(this.get('page', 'className', '')
      .split(' '))
      .filter(c => c)
      .filter(c => c !== className)

    this.setPageClass(current)
    return this
  }
}
