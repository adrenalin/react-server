import React from 'react'
import {
  Container,
  Row,
  Col
} from 'reactstrap'
import Page from '../../lib/page'

module.exports = class DefaultError extends Page {
  static get STATUS_CODE () {
    return 500
  }

  static get propTypes () {
    return {
      args: Page.PropTypes.array,
      error: Page.PropTypes.string,
      errors: Page.PropTypes.object,
      location: Page.PropTypes.oneOfType([
        Page.PropTypes.object,
        Page.PropTypes.string
      ]),
      title: Page.PropTypes.string,
      message: Page.PropTypes.string
    }
  }

  /**
   * Get the error message
   *
   * @return { React.node }           React node for rendering
   */
  getErrorMessage () {
    const errors = []

    // Single error
    if (this.props.errors) {
      Object.keys(this.props.errors).forEach((key) => {
        const error = this.props.errors[key]
        const args = error.args || []
        errors.push(this.l10n.get(error.message || error, ...args))
      })
    }

    // Multiple errors
    if (this.props.error) {
      const args = this.props.args || []
      errors.push(this.l10n.get(this.props.error, ...args))
    }

    // No errors
    if (!errors.length) {
      errors.push(this.l10n.get(this.props.message || `errorMessage${this.constructor.STATUS_CODE}`))
    }

    if (errors.length > 1) {
      return (
        <Container>
          <Row>
            <Col>
              <p>{this.l10n.get('errorMessage400')}:</p>
              <ul>
                {errors.map((err, i) => {
                  return (
                    <li key={`error-${i}`}>{err}</li>
                  )
                })}
              </ul>
            </Col>
          </Row>
        </Container>
      )
    }

    return (
      <p>{errors[0]}</p>
    )
  }

  /**
   * Render error page
   *
   * @return { React.node }           React node for rendering
   */
  render () {
    const title = this.props.title || `errorTitle${this.constructor.STATUS_CODE}`

    return (
      <Container>
        <Row>
          <Col>
            <h1>{this.l10n.get(title)}</h1>
            {this.getErrorMessage()}
          </Col>
        </Row>
      </Container>
    )
  }
}
