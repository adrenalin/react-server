import React from 'react'
import {
  Alert,
  Col,
  Container,
  Row
} from 'reactstrap'

import { Localization } from '@adrenalin/helpers.js'
import Logger from '@adrenalin/logger'
import ApplicationStore from '../../data/application/store'

export default class ErrorBoundary extends React.Component {
  state = {
    error: null
  }

  constructor (...args) {
    super(...args)
    this.logger = new Logger(this)
    this.application = ApplicationStore.getState()
    this.lang = this.application.lang || 'fi'
    this.l10n = new Localization(this.lang)
    this.logger.setLevel(5)
  }

  /**
   * Get derived state from error
   *
   * @param { Error } error           Caught error
   */
  static getDerivedStateFromError (error) {
    return {
      error
    }
  }

  /**
   * Catch component errors
   *
   * @param { Error } err             Caught error
   * @param { object } info           Error information
   */
  componentDidCatch (err, info) {
    this.logger.error('Error', err, 'info', info)

    this.setState({
      error: err,
      info
    })

    if (typeof window !== 'undefined' && typeof $ !== 'undefined') {
      $('body').addClass('error-boundary')
    }
  }

  /**
   * Get error display width
   *
   * @return { number }               Error column width
   */
  getErrorWidth () {
    return this.state.error.stack && this.application.errors ? 6 : 12
  }

  /**
   * Render stack traces
   *
   * @return { ReactChild }           React child for rendering
   */
  renderStackTraces () {
    if (!this.application.errors) {
      return null
    }

    return (
      <Row>
        {this.renderErrorStackTrace()}
        {this.renderComponentStackTrace()}
      </Row>
    )
  }

  /**
   * Render stack trace
   *
   * @return { ReactChild }           React child for rendering
   */
  renderStackTrace (stack) {
    return (
      <pre className='pre-line border border-danger p-2 text-small'>
        {this.state.error.stack}
      </pre>
    )
  }

  getErrorClasses (width, side) {
    const opposite = side === 'l' ? 'r' : 'l'
    const classes = [
      'p-0',
      'mb-4'
    ]

    if (width === 6) {
      classes.push(`p${side}-md-0`)
      classes.push(`p${opposite}-md-2`)
    }

    return classes.join(' ')
  }

  /**
   * Render error stack trace
   *
   * @return { ReactChild }           React child for rendering
   */
  renderErrorStackTrace () {
    if (!this.state.error.stack) {
      return null
    }

    if (!this.application.errors) {
      return null
    }

    const w = this.getErrorWidth()

    return (
      <Col className={this.getErrorClasses(w, 'l')} xs={12} md={w}>
        <Container>
          <Row>
            <Col className='content rounded-md p-2 p-lg-3'>
              <h3>{this.l10n.get('errorFoundIn')}</h3>
              {this.renderStackTrace(this.state.error.stack)}
            </Col>
          </Row>
        </Container>
      </Col>
    )
  }

  /**
   * Render component stack trace
   *
   * @return { ReactChild }           React child for rendering
   */
  renderComponentStackTrace () {
    if (!this.state.info || !this.state.info.componentStack || !this.application.errors) {
      return null
    }

    const w = this.getErrorWidth()

    return (
      <Col className={this.getErrorClasses(w, 'r')} xs={12} md={w}>
        <Container>
          <Row>
            <Col className='content rounded-md p-2 p-lg-3'>
              <h3>Component stack trace</h3>
              {this.renderStackTrace(this.state.info.componentStack)}
            </Col>
          </Row>
        </Container>
      </Col>
    )
  }

  /**
   * Render error page
   *
   * @return { ReactChild }           React child for rendering
   */
  render () {
    if (this.state.error) {
      const err = this.state.error.message || this.state.error
      const statusCode = this.state.error.statusCode || 500

      return (
        <Container>
          <h1>{this.l10n.get(`errorTitle${statusCode}`)}</h1>
          <Row>
            <Col className='content rounded-md p-2 p-lg-3 mb-3'>
              <p>{this.l10n.get('somethingWentWrong')}</p>
              <Alert color='danger'>
                {err}
              </Alert>
            </Col>
          </Row>
          {this.renderStackTraces()}
        </Container>
      )
    }

    return this.props.children
  }
}
