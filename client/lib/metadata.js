// const debug = require('debug')('Metadata')
const Logger = require('@adrenalin/logger')
const { castToArray, getValue, setValue } = require('@adrenalin/helpers.js')

module.exports = class Metadata {
  constructor () {
    this.logger = new Logger(this)
    this.logger.setLevel(5)
    this.values = {}
    this.listeners = {}
    this.url = '/'
  }

  /**
   * Bind to metadata object given e.g. in server side renderer
   */
  bindTo (obj) {
    this.values = obj || {}
  }

  /**
   * Flush metadata and return the previous metadata object
   *
   * @return { object }               Copy of the current metadata object
   */
  flush () {
    const values = JSON.parse(JSON.stringify(this.values))

    for (const k in this.values) {
      delete this.values[k]
    }

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
   * @param { string } key            Metadata key
   * @param { mixed } value           Metadata value
   * @return { Metadata }             This instance
   */
  set (domain, key, value) {
    const p = `${domain}.${key}`

    if (getValue(this.values, p) !== value) {
      setValue(this.values, p, value)
      this.trigger(domain, key, value)
    }

    return this
  }

  /**
   ' Get a value to metadata domain with key
   *
   * @param { string } domain         Name of the metadata domain
   * @param { string } key            Metadata key
   * @return { mixed }                Stored metadata value or null
   */
  get (domain, key) {
    return getValue(this.values, `${domain}.${key}`)
  }

  /**
   * Append a value to the metadata
   *
   * @param { string } domain         Metadata domain
   * @param { string } key            Metadata key
   * @param { string } value          Metadata value
   */
  append (domain, key, value) {
    const p = `${domain}.${key}`

    // Ensure that the storage is an array
    const values = castToArray(getValue(this.values, p))

    // Ensure unique values
    if (values.includes(value)) {
      return this
    }

    values.push(value)

    setValue(this.values, p, values)

    return this
  }

  /**
   * Trim a string
   *
   * @param { mixed } value           Value to trim
   * @return { mixed }                Trimmed string or the original value
   */
  trim (value) {
    if (typeof value !== 'string') {
      return value
    }

    return value.replace(/(^\s*|\s*$)/g, '')
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
   * @param { string } key            Opengraph key
   * @param { mixed } value           Opengraph value
   * @return { Metadata }             This instance
   */
  opengraph (key, value) {
    if (!key.match(/^[a-z]+:/)) {
      key = `og:${key}`
    }

    if (key === 'og:image') {
      this.append('opengraph', key, value)
    } else {
      this.set('opengraph', key, value)
    }

    return this
  }

  /**
   ' Set the metadata status code for server side rendering
   *
   * @param { number } code           HTTP/1.1 status code
   * @return { Metadata }             This instance
   */
  setStatusCode (code) {
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

    this.set('page', 'title', parts.join(' | '))
    this.opengraph('title', parts.join(' | '))

    if (typeof document !== 'undefined') {
      const siteTitle = this.get('site', 'title')

      if (siteTitle) {
        parts.push(siteTitle)
      }

      document.title = parts.join(' | ')
    }

    return this
  }

  /**
   * Set breadcrumb path
   *
   * @param { array } path            Set breadcrumb path
   * @return { Metadata }             This instance
   */
  setBreadcrumbPath (path) {
    path = path || []

    if (!Array.isArray(path)) {
      throw new Error('setBreadcrumbPath requires path as an array')
    }

    this.set('navigation', 'breadcrumb', path)
    this.trigger('navigation', 'breadcrumb')
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
    this.listeners[domain] = this.listeners[domain] || {}
    this.listeners[domain][key] = this.listeners[domain][key] || []

    if (!callback) {
      this.listeners[domain][key].splice(0, this.listeners[domain][key])
      return this
    }

    // Check if there is a matching listener
    const index = this.listeners[domain][key].indexOf(callback)

    // If a listener was found, unpluck it
    if (index > -1) {
      this.listeners[domain][key].splice(index, 1)
    }

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
  trigger (domain, key, value) {
    const listeners = this.listeners[domain] && this.listeners[domain][key]
      ? this.listeners[domain][key]
      : []

    listeners.forEach((callback) => {
      try {
        callback(value)
      } catch (err) {
        this.logger.error('Failed to trigger metadata listener for domain', domain, 'with key', key)
        this.logger.error('Error', err)
      }
    })

    return this
  }

  /**
   * Set page class
   *
   * @param { string } className      Page class name
   */
  setPageClass (className) {
    if (typeof $ !== 'undefined') {
      $('body').attr('class', className)
    }
    this.set('page', 'className', this.trim(className))
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
    let current = this.get('page', 'className') || ''

    if (current.indexOf(className) === -1) {
      current += ` ${className}`
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
    let current = this.get('page', 'className') || ''

    if (current.indexOf(className) !== -1) {
      const escaped = className.replace(/-/g, '\\-')
      current = current.replace(new RegExp(`(^| )${escaped}($| )`, 'g'), ' ').replace(/ {2}/, ' ')
    }

    this.setPageClass(current)
    return this
  }

  /**
   * Get current URL
   *
   * @return { string }               Current URL
   */
  getCurrentUrl () {
    if (typeof window !== 'undefined') {
      return window.location.href
    }

    return this.url
  }
}
