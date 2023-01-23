import React from 'react'
import {
  Col,
  Container,
  Row
} from 'reactstrap'

import DefaultError from '../errors/defaulterror'

/**
 * HTTP/1.1 301 Moved Permanently
 *
 * @class MovedPermanently
 * @param { object } props            Component props
 */
module.exports = class MovedPermanently extends DefaultError {
  static get propTypes () {
    return {
      location: DefaultError.PropTypes.string.isRequired
    }
  }

  /**
   * Status code
   *
   * @const { number } MovedPermanently.STATUS_CODE
   */
  static get STATUS_CODE () {
    return 302
  }

  constructor (props) {
    super(props)
    this.metadata.setLocation(props.location)
  }

  /**
   * React component lifecycle event that will be triggered after the component
   * has been mounted to DOM
   *
   * @method Component#componentDidMount
   */
  componentDidMount () {
    super.componentDidMount()
    this.metadata.setStatusCode(this.statusCode)
    this.metadata.setLocation(this.props.location)
    setTimeout(() => {
      window.location.href = this.props.location
    })
  }

  /**
   * Render the component
   *
   * @method MovedPermanently#render
   * @return { React.node }           React node for rendering
   */
  render () {
    const link = `<a href=${this.props.location}>${this.props.location}</a>`

    return (
      <Container>
        <h1>{this.l10n.get('youAreBeingRedirected')}</h1>
        <Row>
          <Col className='content rounded-md p-2 p-lg-3 mb-4'>
            <p
              className='mb-0'
              dangerouslySetInnerHTML={{
                __html: this.l10n.get('youAreBeingRedirectedTo', link)
              }}
            />
          </Col>
        </Row>
      </Container>
    )
  }
}
