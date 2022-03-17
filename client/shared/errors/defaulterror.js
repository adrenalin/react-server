import React from 'react'
import {
  Container,
  Row,
  Col
} from 'reactstrap'
import Component from '../../lib/component'

export default class DefaultError extends Component {
  static STATUS_CODE = 500

  static propTypes = {
    args: Component.PropTypes.array,
    error: Component.PropTypes.string,
    errors: Component.PropTypes.object,
    location: Component.PropTypes.oneOfType([
      Component.PropTypes.object,
      Component.PropTypes.string
    ]),
    title: Component.PropTypes.string,
    message: Component.PropTypes.string
  }

  constructor (props) {
    super(props)
    this.metadata.setStatusCode(this.constructor.STATUS_CODE)
  }

  /**
   * Get the error message
   *
   * @return { ReactChild }           React child for rendering
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
   * @return { ReactChild }           React child for rendering
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
