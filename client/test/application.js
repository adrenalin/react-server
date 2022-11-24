import React from 'react'
import {
  Container,
  Row,
  Col
} from 'reactstrap'
import {
  Switch,
  Route
} from 'react-router-dom'
import routes from './routes'
import Component from '../lib/component'
import Logo from '../widgets/logo'
import navigation from './config/navigation'

import { Localization } from '@adrenalin/helpers.js'

// import AuthWrapper from '../shared/auth/authwrapper'
import Footer from '../structure/footer'
import Navigation from '../structure/navigation'

import Notifications from '../shared/notifications'

// Error pages
import ErrorBoundary from '../shared/errors/errorboundary'
import NotFound from '../shared/errors/notfound'

import ApplicationStore from '../data/application/store'
import LocalesStore from '../data/locales/store'

module.exports = class Application extends Component {
  static get propTypes () {
    return {
      children: Component.PropTypes.child,
      context: Component.PropTypes.object,
      router: Component.PropTypes.func,
      routerProps: Component.PropTypes.object,
      metadata: Component.PropTypes.object
    }
  }

  constructor (props) {
    super(props)

    // Register project configuration
    this.config.set(ApplicationStore.getState().config || {})
    Localization.registerLocales(LocalesStore.getState().locales || {})

    this.metadata.bindTo(props.metadata || {})

    this.metadata.set('http', 'location', this.config.get('currentUrl'))
    this.metadata.set('site', 'title', this.config.get('site.title'))

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
   * @return { ReactChild }           React child for rendering
   */
  renderRouter () {
    return (
      <Switch>
        {Object.keys(routes).map((path, i) => {
          const route = routes[path]
          path = route.path || path

          return (
            <Route path={path} {...route} key={`route-${i}`} />
          )
        })}
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
        <Notifications />
        <Container id='header' fluid>
          <Row className='logo-container'>
            <Col id='siteLogo' className='px-2 pl-md-3'>
              <Logo />
            </Col>
            <Col id='navigation' className='p-0 px-lg-3'>
              <Navigation items={navigation} />
            </Col>
          </Row>
        </Container>
        <ErrorBoundary>
          <Container id='content' fluid className='py-3 px-1 py-md-3 px-md-3 p-md-0'>
            {this.renderRouter()}
          </Container>
        </ErrorBoundary>
        <Footer />
      </RouterType>
    )
  }
}
