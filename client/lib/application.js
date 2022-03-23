import React from 'react'
import {
  Switch,
  Route
} from 'react-router-dom'
import Widget from '../widgets'

import { Localization } from '@adrenalin/helpers.js'

// Error pages
import ErrorBoundary from '../shared/errors/errorboundary'
import NotFound from '../shared/errors/notfound'

import ApplicationStore from '../data/application/store'
import LocalesStore from '../data/locales/store'

module.exports = class Application extends Widget {
  static propTypes = {
    children: Widget.PropTypes.child,
    context: Widget.PropTypes.object,
    router: Widget.PropTypes.func,
    routerProps: Widget.PropTypes.object,
    metadata: Widget.PropTypes.object
  }

  static LOG_LEVEL = 3

  constructor (props) {
    super(props)

    // Register project configuration
    this.config.set(ApplicationStore.getState().config || {})
    Localization.registerLocales(LocalesStore.getState().locales || {})

    this.metadata.bindTo(props.metadata || {})

    this.metadata.set('http', 'location', this.config.get('currentUrl'))
    this.metadata.set('site', 'title', this.config.get('site.title'))

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
