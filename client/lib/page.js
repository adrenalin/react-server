import React from 'react'
import Component from './component'

module.exports = class Page extends Component {
  /**
   * Page type as defined for JSON-LD (https://json-ld.org/)
   *
   * @return { string }               Page type definition
   */
  static get METADATA_PAGE_TYPE () {
    return 'WebPage'
  }

  /**
   * Is the current page free
   *
   * @return { boolean }              True for freely accessible content
   */
  static get METADATA_PAGE_IS_FREE () {
    return true
  }

  /**
   * Paywall mask path
   *
   * @return { null|string }          CSS path for paywalled content
   */
  static get METADATA_PAYWALL_MASK () {
    return null
  }


  /**
   * Initialize the component
   */
  onInitialized () {
    this.setClassToBody()
    this.setPageUrl()
    this.setPageTitle()
    this.setPageDescription()
    this.setBreadcrumbPath()
  }

  /**
   * Initialize hook for metadata
   */
  onInitializeMetadata () {
    this.metadata.set('page', 'type', this.constructor.METADATA_PAGE_TYPE)
    this.metadata.set('page', 'isFree', !!this.constructor.METADATA_PAGE_IS_FREE)
    this.metadata.set('page', 'paywallMask', this.constructor.METADATA_PAYWALL_MASK)
  }

  /**
   * Set page class to body
   */
  setClassToBody () {
    const className = this.getPageClass()

    if (className == null) {
      return null
    }

    this.logger.debug('Set body class to', className)
    this.metadata.setPageClass(className)
  }

  /**
   * Get the page class for this component
   *
   * @param {string}                  Body class
   */
  getPageClass () {
    return ''
  }

  /**
   * Set page URL
   *
   * This is used especially for canonical URLs and OpenGraph URL to override
   * the request URL
   */
  setPageUrl (url) {
    url = url || this.getPageUrl()

    if (url != null) {
      this.metadata.set('page', 'url', url)
    }
  }

  /**
   * Get page URL if it should not be the request URL
   *
   * @return { string }               Page URL
   */
  getPageUrl () {
    return null
  }

  /**
   * Set page description
   */
  setPageDescription (description) {
    description = description || this.getPageDescription()

    if (description != null) {
      this.metadata.set('page', 'description', description.replace(/[\n\r]+/g, ' '))
    }
  }

  /**
   * Get page description
   *
   * @return { string }               Page description
   */
  getPageDescription () {
    return null
  }

  /**
   * Get page title
   *
   * @return { string|array }         String or array of strings describing context title
   */
  getPageTitle () {
    return null
  }

  /**
   * Set page title
   *
   * @param {mixed} title             A string or an array of strings
   */
  setPageTitle (title) {
    if (title == null && typeof this.getPageTitle === 'function') {
      title = this.getPageTitle()
    }

    if (Array.isArray(title)) {
      this.logger.debug('Got an array title', title)
      title = title.join(' | ')
    }

    if (title == null) {
      return
    }

    if (typeof title !== 'string') {
      this.logger.warn('Tried to set a non-string title', title)
      return
    }

    this.metadata.setTitle(title)
  }

  /**
   * Get breadcrumb path for this component
   *
   * @return {mixed}                  An array of objects { url, label } or null
   */
  getBreadcrumbPath () {
    return null
  }

  /**
   * Set breadcrumb path to the current metadata
   */
  setBreadcrumbPath () {
    const parts = this.getBreadcrumbPath()

    if (!Array.isArray(parts)) {
      return
    }

    this.logger.debug('Got breadcrumb parts', parts)
    this.metadata.setBreadcrumbPath(parts)
  }

  /**
   * React component lifecycle event that will be triggered after the component
   * has been mounted to DOM
   */
  componentDidMount () {
    super.componentDidMount()
    this.setClassToBody()
    this.setPageTitle()
    this.setBreadcrumbPath()
  }

  /**
   * React component lifecycle event that will be triggered after the props
   * have changed
   *
   * @param { object } prevProps      Previous properties
   * @param { object } prevState      Previous state
   * @param { object } snapshot       Snapshot of the component
   */
  componentDidUpdate (prevProps, prevState, snapshot) {
    super.componentDidUpdate(prevProps, prevState, snapshot)
    this.setClassToBody()
    this.setPageTitle()
    this.setBreadcrumbPath()
  }

  /**
   * React component lifecycle event that will be triggered before the component
   * will be unmounted to DOM
   */
  componentWillUnmount () {
    super.componentWillUnmount()
    this.unbindEvents()

    if (this.getPageClass()) {
      this.metadata.setPageClass('')
    }

    const stores = this.constructor.STORES || []
    stores.forEach((store) => {
      this.logger.debug('Will unlisten', store.displayName)
      store.unlisten(this.listeners[store.displayName])
    })
  }
}
