import React from 'react'
import {
  Alert,
  Col,
  Container,
  FormFeedback,
  Row
} from 'reactstrap'
import PropTypes from 'prop-types'
import Moment from 'moment-timezone'

import EventHandler from './events'
import Metadata from './metadata'
import request from './request'
import helpers from '@adrenalin/helpers.js'
import Logger from '@adrenalin/logger'
import ApplicationStore from '../data/application/store'
import UserStore from '../data/user/store'

const validate = require('../lib/helpers/validate')

const localization = new helpers.Localization()
let currentLanguage = 'fi'

const events = new EventHandler()
const metadata = new Metadata()
const config = new helpers.Config()

if (!PropTypes.child) {
  PropTypes.child = PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.element,
    PropTypes.number,
    PropTypes.object,
    PropTypes.string
  ])
}

module.exports = class Component extends React.Component {
  static LOG_LEVEL = 3

  static request = request

  static PropTypes = PropTypes

  static propTypes = {}

  static REQUIRED_STATE_KEYS = []

  static USER_PREFERENCE_LOCALSTORAGE_PATH = 'user.preferences'

  /**
   * Get derived state from props
   *
   * @param { object } props          Context props
   * @param { object } state          Context state
   * @return { object }               State
   */
  static getDerivedStateFromProps (props, state) {
    state = state || {}
    return state
  }

  /**
   * Register global configuration
   *
   * @param {object} conf             Configuration object
   */
  static registerConfiguration (conf) {
    conf = conf || {}

    for (const k in conf) {
      config[k] = conf[k]
    }
  }

  /**
   * Constructor to initialize the component
   *
   * @param { object } props          Component props
   */
  constructor (props) {
    super(props)
    this.logger = new Logger(this)

    this.config = config
    this.helpers = helpers

    // Localization
    if (ApplicationStore.getState().lang) {
      currentLanguage = ApplicationStore.getState().lang
    }

    // Localization context
    this.lang = ApplicationStore.getState().lang || currentLanguage
    this.l10n = localization.setLang(this.lang)

    // User
    this.user = UserStore.getState().user

    this.events = events
    this.request = request
    this.metadata = metadata
    this.logger.setLevel(this.constructor.LOG_LEVEL)

    // Deprecation warning
    if (this.constructor.stores) {
      this.logger.warn('Using static attribute "stores" is deprecated')
    }

    // Stores to be listened
    const stores = this.constructor.STORES || []
    this.listeners = []

    // Create a listener for each of the registered store
    stores.forEach((store) => {
      this.logger.debug('Will register a state listener for', store.displayName)
      const onChange = `on${store.displayName}StateChange`
      const onChanged = `on${store.displayName}StateChanged`
      this.logger.debug(typeof this[onChange], onChange)

      this.listeners[store.displayName] = (state) => {
        switch (true) {
          case typeof this[onChange] === 'function':
            this.logger.debug('Locally defined', onChange, 'called with state', state)
            this[onChange](state)
            break

          case typeof this.onStoreStateChange === 'function':
            this.logger.debug('Locally defined onStoreStateChange called with state', state)
            this.onStoreStateChange(state)
            break

          default:
            this.logger.debug('Default', onChange, 'called with state', state)
            this.setState({
              ...state,
              error: state.error || this.state.error
            })
        }

        switch (true) {
          case typeof this[onChanged] === 'function':
            this.logger.debug('Locally defined', onChanged, 'called')
            this[onChanged]()
            break

          case typeof this.onStoreStateChanged === 'function':
            this.onStoreStateChanged()
        }
      }

      this.listeners[store.displayName].bind(this)
    })

    this.onInitialize()
  }

  /**
   * Get initial state for the component
   *
   * @return { object }               Initial component state
   */
  getInitialState () {
    return {}
  }

  /**
   * Set initial state for the component
   */
  setInitialState (state = {}) {
    const constructorState = this.state || {}
    this.state = { // eslint-disable-line react/no-direct-mutation-state
      ...constructorState,
      ...state
    }
  }

  /**
   * Initialize the component
   */
  onInitialize () {
    this.setInitialState(this.getInitialState())
    this.setClassToBody()
    this.setPageUrl()
    this.setPageTitle()
    this.setPageDescription()
    this.setBreadcrumbPath()
  }

  /**
   * React component lifecycle event that will be triggered after the component
   * has been mounted to DOM
   */
  componentDidMount () {
    // super.componentDidMount()
    this.setClassToBody()
    this.bindEvents()
    this.setPageTitle()
    this.setBreadcrumbPath()

    const stores = this.constructor.STORES || []
    stores.forEach((store) => {
      this.logger.debug('Will listen to', store.displayName, 'with', this.listeners[store.displayName])
      store.listen(this.listeners[store.displayName])
    })

    // Automatically fetch items for the loaders
    const loaders = this.constructor.LOADERS || []
    loaders.forEach((loader) => {
      if (loader.fetchItems == null) {
        return
      }

      loader.fetchItems()
    })

    this.loadData()
  }

  /**
   * Load data
   */
  loadData () {

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
    // super.componentDidUpdate(prevProps, prevState, snapshot)
    this.setClassToBody()
    this.setPageTitle()
    this.setBreadcrumbPath()
  }

  /**
   * React component lifecycle event that will be triggered before the component
   * will be unmounted to DOM
   */
  componentWillUnmount () {
    // super.componentWillUnmount()
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
   * Get current url
   *
   * @return { string }               Current URL
   */
  getCurrentUrl () {
    if (typeof window !== 'undefined' && window.location) {
      return String(window.location)
    }

    return ApplicationStore.getState().currentUrl || null
  }

  /**
   * Should the articles be displayed
   *
   * @return { boolean }              True if the articles should be displayed
   */
  getDisplayArticles () {
    return !this.config.get('articles.disabled') && ['fi', 'sv'].includes(this.lang)
  }

  /**
   * Bind component events
   */
  bindEvents () {
    // Placeholder
  }

  /**
   * Unbind component events
   */
  unbindEvents () {
    // Placeholder
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
   * @return { string|array }         String or array of strings
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
   * Stop the HTML body from scrolling
   *
   * @param {string} [state]          Additional class name to be appended to body
   */
  stopBodyScroll (state) {
    $('body').addClass('no-scroll')

    if (state) {
      $('body').addClass(state)
    }
  }

  /**
   * Allow the HTML body to scroll if it was disabled
   *
   * @param {string} [state]          Additional class name to be removed from body
   */
  allowBodyScroll (state) {
    $('body').removeClass('no-scroll')

    if (state) {
      $('body').removeClass(state)
    }
  }

  /**
   * Scroll to target
   *
   * @param { string } target         Target path
   * @param { number } [speed=400]    Scrolling speed
   * @param { boolean } [force=false] Force scroll even if in view
   */
  scrollToTarget (target, speed = 400, force = false) {
    const t = $(target)

    if (!t.length) {
      return
    }

    const offset = t.eq(0).offset().top
    const viewportMin = $(window).scrollTop()
    const viewportMax = viewportMin + $(window).height()

    if (!force && offset > viewportMin && offset < viewportMax) {
      return
    }

    $('html, body').animate({
      scrollTop: `${offset}px`
    }, speed)
  }

  /**
   * Check if any of the registered stores is loading data from the API
   *
   * @return { boolean }              True if any of the registered stores is loading
   */
  isLoading () {
    const stores = this.constructor.STORES || []

    for (let i = 0; i < stores.length; i++) {
      const store = stores[i]
      if (typeof store.isLoading === 'function' && store.isLoading()) {
        this.logger.debug('Store', store.displayName, 'is loading')
        return true
      }
    }

    if (this.state.loading) {
      this.logger.debug('State is set as "loading"')
      return this.state.loading
    }

    for (let i = 0; i < this.constructor.REQUIRED_STATE_KEYS.length; i++) {
      const key = this.constructor.REQUIRED_STATE_KEYS[i]

      if (!this.state[key]) {
        this.logger.debug('Required state key', key, 'is missing, component is loading')
        return true
      }
    }

    this.logger.debug('Not loading anything')
    return false
  }

  /**
   * Shorthand for the field validation of this context
   *
   * @return { object }               Validation errors
   */
  validate () {
    const fields = this.constructor.FIELDS

    if (!fields) {
      throw new Error(`No FIELDS defined for component ${this.constructor.name}`)
    }

    return validate(this.state.values || {}, fields)
  }

  /**
   * Generic onFocus event for form inputs
   *
   * @param { event } e               Input onFocus event
   */
  onFocus (e) {
    this.onChange(e)
  }

  /**
   * Get checkbox value
   *
   * @param { string } name           Input field name
   * @param { mixed } value           Input field value
   * @return { array|string }         Array for multiple, string for singular
   */
  getCheckboxValue (name, value) {
    const checked = this.helpers.castToArray(this.helpers.getValue(this.state.values || {}, name, []))
    const hasMultiple = this.helpers.getValue(this.constructor.FIELDS, `${name}.multiple`, false)

    if (!hasMultiple) {
      return checked.includes(value) ? null : value
    }

    if (checked.includes(value)) {
      checked.splice(checked.indexOf(value), 1)
      return checked
    }

    checked.push(value)
    return checked
  }

  /**
   * Generic onChange event for form inputs
   *
   * @param { event } e               Input onFocus event
   */
  onChange (e) {
    const { name, value } = e.target
    const values = this.state.values || {}

    const type = this.helpers.getValue(this.constructor.FIELDS || {}, `${name}.type`, e.target.type)

    switch (type) {
      case 'checkbox':
        this.helpers.setValue(values, name, this.getCheckboxValue(name, value))
        break

      case 'number':
        this.helpers.setValue(values, name, this.helpers.typecastString(value))
        break

      case 'boolean':
        this.helpers.setValue(values, name, !!this.helpers.typecastString(value))
        break

      default:
        this.helpers.setValue(values, name, value)
    }

    const errors = this.validate()

    const touched = this.state.touched || {}
    touched[name] = true

    this.setState({
      errors,
      touched,
      values
    })
  }

  /**
   * Check if the field is valid
   *
   * @param { string } field          Field name
   */
  isValid (field) {
    const touched = this.state.touched || {}
    const error = this.helpers.getValue(this.state, `errors.${field}`)

    if (!touched[field]) {
      return false
    }

    if (error) {
      return false
    }

    return true
  }

  /**
   * Check if the field is invalid
   *
   * @param { string } field          Field name
   */
  isInvalid (field) {
    const touched = this.state.touched || {}
    const error = this.helpers.getValue(this.state, `errors.${field}`)

    if (!touched[field]) {
      return false
    }

    if (error) {
      return true
    }

    return false
  }

  /**
   * Check if the form can be submitted
   *
   * @return { boolean }              True if the form is ready for submitting
   */
  canSubmit () {
    if (typeof window === 'undefined') {
      return true
    }

    const errors = this.validate()

    if (Object.keys(errors).length) {
      this.logger.log('Form cannot be submitted, found form errors', errors)
      return false
    }

    return true
  }

  /**
   * Render error
   *
   * @param { string } key            Field name
   * @return { mixed }                React child or null if not applicable
   */
  renderFormError (key) {
    const error = this.helpers.getValue(this.state, `errors.${key}`)

    if (!error || !this.state.touched[key]) {
      return null
    }

    const args = error.args || []
    const message = error.error || error.message || error

    return (
      <FormFeedback>{this.l10n.get(message, ...args)}</FormFeedback>
    )
  }

  /**
   * Get all user preferences
   */
  getPreferences () {
    if (typeof localStorage === 'undefined') {
      return {}
    }

    const user = this.user || {}
    return user.preferences || JSON.parse(localStorage.getItem(this.constructor.USER_PREFERENCE_LOCALSTORAGE_PATH))
  }

  /**
   * Get user preference value
   *
   * @param { string } path           Path to the preference
   * @param { mixed } defaultValue    Default value
   */
  getPreference (path, defaultValue = null) {
    if (typeof localStorage === 'undefined') {
      return defaultValue
    }

    try {
      return this.helpers.getValue(this.getPreferences(), path, defaultValue)
    } catch (err) {
      return defaultValue
    }
  }

  /**
   * Set user preference
   */
  setPreference (path, value) {
    try {
      this.logger.debug('Saving user preference to path', path, 'as value', value)
      const stored = this.getPreferences() || {}
      const preferences = this.helpers.setValue(stored, path, value)

      localStorage.setItem(this.constructor.USER_PREFERENCE_LOCALSTORAGE_PATH, JSON.stringify(preferences))

      // this.request.patch('/api/user/preferences', preferences)
      //   .then((response) => {
      //     this.logger.info('User preferences saved')
      //     this.logger.debug('Response', response)
      //     UserStore.fetchItem()
      //   })
      //   .catch((err) => {
      //     this.logger.error('Failed to set preference', err.message)
      //     this.logger.info('Stack', err.stack)
      //     this.logger.info('Save to path', path)
      //     this.logger.info('Save value', value)
      //   })

      return this
    } catch (err) {
      this.logger.error('Failed to set a preference', err)
      return this
    }
  }

  /**
   * Get user roles
   *
   * @return { array }                User roles
   */
  getUserRoles () {
    const user = UserStore.getState().user

    if (!user) {
      return []
    }

    return this.helpers.castToArray(user.roles || user.role)
  }

  /**
   * Get user expiration
   *
   * @return { Moment }               Expiration moment
   */
  getUserExpiration () {
    const user = UserStore.getState().user

    if (!user) {
      return null
    }

    const expires = new Moment(user.expires)
    expires.set({
      hours: 23,
      minutes: 59,
      seconds: 59
    })

    return expires
  }

  /**
   * Can user view the content
   */
  canUserView () {
    const roles = this.getUserRoles()

    if (roles.includes('admin')) {
      this.logger.log('User is admin, allow viewing all resources')
      return true
    }

    if (this.constructor.REQUIRED_ROLE && roles.includes(this.constructor.REQUIRED_ROLE)) {
      this.logger.log('Required role', this.constructor.REQUIRED_ROLE, 'found for the user')
      return true
    }

    const expiration = this.getUserExpiration()

    if (!expiration) {
      return false
    }

    return expiration.isAfter(new Date())
  }

  /**
   * Render the error from the component state if applicable
   *
   * @return { ReactChild }           React child for rendering
   */
  renderError () {
    /**
     * Get the error message for different error types
     */
    const getError = () => {
      const err = this.state.error

      if (!err) {
        return null
      }

      const message = this.helpers.getValue(err, ['response.data.message', 'message'])

      return message || err
    }

    const error = getError()

    if (!error) {
      return null
    }

    return (
      <Alert color='danger'>
        {this.l10n.get(error)}
      </Alert>
    )
  }

  /**
   * Render onLoading view
   *
   * @return { ReactChild }           React child for rendering
   */
  renderOnLoading () {
    return (
      <Container>
        <h1>{this.helpers.castToArray(this.getPageTitle())[0]}</h1>
        <Row>
          <Col className='content rounded-md p-2 p-lg-3'>
            {this.l10n.get('loadingData')}
          </Col>
        </Row>
      </Container>
    )
  }

  /**
   * Render role required view
   *
   * @return { ReactChild }           React child for rendering
   */
  renderRoleRequired () {
    return (
      <Container>
        <h1>{this.helpers.castToArray(this.getPageTitle())[0]}</h1>
        <Row>
          <Col className='content rounded-md p-2 p-lg-3'>
            <p className='mb-0'>
              {this.l10n.get('requiredRoleS', this.constructor.REQUIRED_ROLE)}
            </p>
          </Col>
        </Row>
      </Container>
    )
  }

  /**
   * Render paywalled view
   *
   * @return { ReactChild }           React child for rendering
   */
  renderPaywalled () {
    return (
      <Container>
        <h1>{this.helpers.castToArray(this.getPageTitle())[0]}</h1>
        <Row>
          <Col className='content rounded-md p-2 p-lg-3'>
            <p>
              {this.l10n.get('requiresSubscription')}
            </p>
            <p
              dangerouslySetInnerHTML={{
                __html: this.getPageDescription()
              }}
              className='mb-0'
            />
          </Col>
        </Row>
      </Container>
    )
  }

  /**
   * Render the component
   *
   * @return { ReactChild }           React child for rendering
   */
  render () {
    if (this.isLoading()) {
      return this.renderOnLoading()
    }

    if (!this.canUserView()) {
      if (this.constructor.REQUIRED_ROLE) {
        return this.renderRoleRequired()
      }

      const paywalled = this.renderPaywalled()

      if (paywalled) {
        return paywalled
      }
    }

    return this.renderView()
  }
}
