import React from 'react'
import {
  Switch,
  Route
} from 'react-router-dom'
import Component from '../lib/component'

import { Localization } from '@vapaaradikaali/helpers.js'

// Error pages
import ErrorBoundary from '../shared/errors/errorboundary'

import ApplicationStore from '../data/application'
import LocalesStore from '../data/locales'

module.exports = class Application extends Component {
  static get DEFAULT_LANG () {
    return 'en'
  }

  static get propTypes () {
    return {
      children: Component.PropTypes.child,
      context: Component.PropTypes.object,
      router: Component.PropTypes.func,
      routerProps: Component.PropTypes.object,
      metadata: Component.PropTypes.object
    }
  }

  /**
   * Pre initialization hook
   */
  onInitializing () {
    if (this.props.metadata) {
      this.metadata.bindTo(this.props.metadata)
    }

    this.initConfig()
    this.registerLocales()
    this.initRequest()
  }

  /**
   * Initialize metadata
   */
  initializeMetadata () {
    this.metadata.set('http', 'location', this.config.get('currentUrl'))

    const site = this.config.get('site', {})

    for (const key in site) {
      this.metadata.set('site', key, site[key])
    }
  }

  /**
   * Initialize application configuration
   */
  initConfig () {
    this.config.set(ApplicationStore.getState().config || {})
  }

  /**
   * Initialize application localization
   */
  registerLocales () {
    // Localization context
    this.lang = ApplicationStore.getState().lang || this.constructor.DEFAULT_LANG
    this.l10n.setLang(this.lang)

    Localization.registerLocales(LocalesStore.getState().locales || {})
  }

  /**
   * Initialize application request interceptors
   */
  initRequest () {
    // Add language headers to Axios requests
    Component.request.interceptors.request.use((config) => {
      config.headers = config.headers || {}
      config.headers['X-Language'] = this.lang
      return config
    }, (err) => {
      return Promise.reject(err)
    })
  }

  /**
   * Get derived state from props
   *
   * @param { object } props          Context props
   * @param { object } state          Context state
   * @return { object }               State
   */
  static getDerivedStateFromProps (props, state) {
    return {
      errorCode: ApplicationStore.getState().statusCode || 200
    }
  }

  /**
   * Get metadata
   *
   * @return { Metadata }             Context metadata
   */
  getMetadata () {
    return this.metadata
  }

  /**
   * Render routers
   *
   * @return { React.node }           React node for rendering
   */
  renderRouter (routes) {
    const routers = []
    Object.keys(routes || {}).forEach((path, i) => {
      const route = routes[path]
      this.helpers.castToArray(route.paths || route.path || path)
        .forEach((p) => {
          const props = {
            ...route
          }

          delete props.path
          delete props.paths

          routers.push((
            <Route {...props} path={p} key={`route-${i}`} />
          ))
        })
    })

    return (
      <Switch>
        {routers}
      </Switch>
    )
  }

  /**
   * Render component
   *
   * @return { React.node }           React node for rendering
   */
  render () {
    const RouterType = this.props.router
    const routerProps = this.props.routerProps || {}
    this.logger.log('routerProps', routerProps)

    return (
      <RouterType {...routerProps}>
        {/* header here */}
        <ErrorBoundary>
          {this.renderRouter()}
        </ErrorBoundary>
        {/* footer here */}
      </RouterType>
    )
  }
}
