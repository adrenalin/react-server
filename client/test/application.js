import React from 'react'
import {
  Container,
  Row,
  Col
} from 'reactstrap'
import routes from './routes'
import Application from '../lib/application'
import Logo from '../widgets/logo'
import navigation from './config/navigation'

// import AuthWrapper from '../shared/auth/authwrapper'
import Footer from '../structure/footer'
import Navigation from '../structure/navigation'

import Notifications from '../shared/notifications'

// Error pages
import ErrorBoundary from '../shared/errors/errorboundary'

import ApplicationStore from '../data/application'

module.exports = class TestApplication extends Application {
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

  getPageNotFoundRouter () {
    return null
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
            {this.renderRouter(routes)}
          </Container>
        </ErrorBoundary>
        <Footer />
      </RouterType>
    )
  }
}
