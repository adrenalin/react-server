import React from 'react'
import {
  Alert,
  Col,
  Container,
  FormFeedback,
  Row
} from 'reactstrap'
import PropTypes from 'prop-types'

import EventHandler from './events'
import Metadata from './metadata'
import request from './request'
import helpers from '@vapaaradikaali/helpers.js'
import Logger from '@vapaaradikaali/logger'
import ApplicationStore from '../data/application'
import UserStore from '../data/user'
import config from './config'

// Singleton instances
const events = new EventHandler()
const metadata = new Metadata()
const localization = new helpers.Localization()
const validate = require('../lib/helpers/validate')
const constants = {}

let currentLang = null

if (!PropTypes.child) {
  PropTypes.child = PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.element,
    PropTypes.number,
    PropTypes.object,
    PropTypes.string
  ])
}

const storage = new helpers.Storage(typeof window !== 'undefined' ? window.localStorage : null)

/**
 * Baseclass for React components
 *
 * @class Component
 * @example
 *
 * ```
 * @import Component from '@adrenalin/react-server'
 * export default class MyComponent extends Component {
 *   static get propTypes {
 *     return {
 *       id: Component.PropTypes.string.isRequired
 *     }
 *   }
 *
 *   render () {
 *     return (
 *       <p id={this.props.id}>
 *         My component
 *       </p>
 *     )
 *   }
 * }
 * ```
 *
 * @param { object } props          Component props
 */
module.exports = class Component extends React.Component {
  /**
   * Constants
   *
   * @const { object } Component.constants
   */
  static get constants () {
    return constants
  }

  /**
   * Instance constants
   *
   * @const { object } Component#constants
   */
  get constants () {
    return constants
  }

  /**
   * Log level for the logger
   *
   * @const { number } Component.LOG_LEVEL
   */
  static get LOG_LEVEL () {
    return Logger.INFO
  }

  /**
   * Get request instance
   *
   * @const { Axios } Component.request
   */
  static get request () {
    return request
  }

  /**
   * Convenience shorthand for prop-types
   *
   * @const { PropTypes } Component.PropTypes
   */
  static get PropTypes () {
    return PropTypes
  }

  /**
   * Class proptypes definitions
   *
   * @const { object } Component.propTypes
   */
  static get propTypes () {
    return {}
  }

  /**
   * Required state keys that should be populated before isLoaded will return
   * true
   *
   * @const { string[] } Component.REQUIRED_STATE_KEYS
   */
  static get REQUIRED_STATE_KEYS () {
    return []
  }

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
   * Get current language
   *
   * @return { string }               Language code
   */
  get lang () {
    return currentLang
  }

  /**
   * Set current language
   */
  set lang (value) {
    currentLang = value
  }

  /**
   * Shared helper functions, https://github.com/vapaaradikaali/helpers.js
   *
   * @const { object } Component#helpers
   */
  get helpers () {
    return helpers
  }

  /**
   * Shared helper functions, https://github.com/vapaaradikaali/helpers.js
   *
   * @const { object } Component.helpers
   */
  static get helpers () {
    return helpers
  }

  /**
   * Extend properties
   *
   * @method Component.extendProps
   * @param { object } props          Extra props to the context
   * @return { object }               Extended props
   */
  static extendProps (props) {
    return {
      ...Component.propTypes,
      ...props
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

    // Bind singletons
    this.config = config
    this.metadata = metadata
    this.l10n = localization
    this.storage = storage

    // User
    this.user = UserStore.getState().user

    this.events = events
    this.request = request
    this.logger.setLevel(this.constructor.LOG_LEVEL)

    // Deprecation warning
    if (this.constructor.stores) {
      this.logger.warn('Using static attribute "stores" is deprecated')
    }

    this.onInitialize()
  }

  /**
   * Get initial state for the component
   *
   * @method Component#getInitialState
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
    this.onInitializing()
    this.initializeLocales()
    this.initializeMetadata()
    this.initializeStores()
    this.setInitialState(this.getInitialState())
    this.onInitialized()
  }

  /**
   * Pre initialization hook
   */
  onInitializing () {}

  /**
   * Post initialization hook
   */
  onInitialized () {}

  /**
   * Initialize locales
   */
  initializeLocales () {
    this.l10n = localization
  }

  /**
   * Initialize metadata
   */
  initializeMetadata () {}

  /**
   * Initialize stores
   */
  initializeStores () {
    // Stores to be listened
    const stores = this.helpers.castToArray(this.constructor.STORES)
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
  }

  /**
   * React component lifecycle event that will be triggered after the component
   * has been mounted to DOM
   *
   * @method Component#componentDidMount
   */
  componentDidMount () {
    // super.componentDidMount()
    this.bindEvents()

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
   *
   * @method Component#loadData
   */
  loadData () {

  }

  /**
   * React component lifecycle event that will be triggered after the props
   * have changed
   *
   * @method Component#componentDidUpdate
   * @param { object } prevProps      Previous properties
   * @param { object } prevState      Previous state
   * @param { object } snapshot       Snapshot of the component
   */
  componentDidUpdate (prevProps, prevState, snapshot) {
    // super.componentDidUpdate(prevProps, prevState, snapshot)
  }

  /**
   * React component lifecycle event that will be triggered before the component
   * will be unmounted to DOM
   *
   * @method Component#componentWillUnmount
   */
  componentWillUnmount () {
    // super.componentWillUnmount()
    this.unbindEvents()

    const stores = this.constructor.STORES || []
    stores.forEach((store) => {
      this.logger.debug('Will unlisten', store.displayName)
      store.unlisten(this.listeners[store.displayName])
    })
  }

  /**
   * Get current url
   *
   * @method Component#getCurrentUrl
   * @param { boolean } omitLang      Omit language
   * @return { string }               Current URL
   */
  getCurrentUrl (omitLang = false) {
    const url = typeof window !== 'undefined' && window.location.pathname ? String(window.location.pathname) : ApplicationStore.getState().currentUrl || ''
    return omitLang ? url.substr(3) : url
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
   * @return { mixed }                React node or null if not applicable
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
   * Can user view the content
   */
  canUserView () {
    return true
  }

  /**
   * Render the error from the component state if applicable
   *
   * @return { React.node }           React node for rendering
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
   * @return { React.node }           React node for rendering
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
   * @return { React.node }           React node for rendering
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
   * Render forbidden
   *
   * @return { React.node }           React node for rendering
   */
  renderForbidden () {
    return (
      <Container>
        <h1>{this.helpers.castToArray(this.getPageTitle())[0]}</h1>
        <Row>
          <Col className='content rounded-md p-2 p-lg-3'>
            <p className='mb-0'>
              {this.l10n.get('accessForbidden')}
            </p>
          </Col>
        </Row>
      </Container>
    )
  }

  /**
   * Render the component
   *
   * @method Component#render
   * @return { React.node }           React node for rendering
   */
  render () {
    if (this.isLoading()) {
      return this.renderOnLoading()
    }

    if (!this.canUserView()) {
      if (this.constructor.REQUIRED_ROLE) {
        return this.renderRoleRequired()
      }

      return this.renderForbidden()
    }

    return this.renderView()
  }
}
