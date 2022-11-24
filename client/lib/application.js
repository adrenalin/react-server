import React from 'react'
import {
  Switch,
  Route
} from 'react-router-dom'
import Widget from '../lib/widget'

import { Localization } from '@adrenalin/helpers.js'

// Error pages
import ErrorBoundary from '../shared/errors/errorboundary'
import NotFound from '../shared/errors/notfound'

import ApplicationStore from '../data/application/store'
import LocalesStore from '../data/locales/store'

module.exports = class Application extends Widget {
  static get DEFAULT_LANG () {
    return 'en'
  }

  static get propTypes () {
    return {
      children: Widget.PropTypes.child,
      context: Widget.PropTypes.object,
      router: Widget.PropTypes.func,
      routerProps: Widget.PropTypes.object,
      metadata: Widget.PropTypes.object
    }
  }

  /**
   * Pre initialization hook
   */
  onInitializing () {
    this.initConfig()
    this.registerLocales()
    this.initRequest()
  }

  /**
   * Initialize metadata
   */
  onInitializeMetadata () {
    this.metadata.bindTo(props.metadata || {})

    super.initializeMetadata()
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
    // Localization
    if (ApplicationStore.getState().lang) {
      currentLanguage = ApplicationStore.getState().lang
    }

    // Localization context
    this.lang = ApplicationStore.getState().lang || currentLanguage
    this.l10n.setLang(this.lang)

    Localization.registerLocales(LocalesStore.getState().locales || {})
  }

  /**
   * Initialize application request interceptors
   */
  initRequest () {
    // Add language headers to Axios requests
    Widget.request.interceptors.request.use((config) => {
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
   * @return { ReactChild }           React child for rendering
   */
  renderRouter (routes) {
    const routers = []
    Object.keys(routes || {}).forEach((path, i) => {
      const route = routes[path]
      this.helpers.castToArray(route.paths || route.path || path)
        .forEach((p) => {
          routers.push((
            <Route path={p} {...route} key={`route-${i}`} />
          ))
        })
    })

    return (
      <Switch>
        {routers}
        <Route component={NotFound} />
      </Switch>
    )
  }

  /**
   * Render component
   *
   * @return { ReactChild }           React child for rendering
   */
  render () {
    const RouterType = this.props.router
    const routerProps = this.props.routerProps || {}
    this.logger.log('routerProps', routerProps)

    return (
      <RouterType {...routerProps}>
        <ErrorBoundary>
          {this.renderRouter()}
        </ErrorBoundary>
        <Footer />
      </RouterType>
    )
  }
}
