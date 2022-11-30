import React from 'react'
import {
  Col,
  Container,
  Row
} from 'reactstrap'

import DefaultError from '../errors/defaulterror'

/**
 * HTTP/1.1 302 Found
 *
 * @class Found
 * @param { object } props            Component props
 */
module.exports = class Found extends DefaultError {
  static get propTypes () {
    return {
      location: DefaultError.PropTypes.string.isRequired
    }
  }

  /**
   * Status code
   *
   * @const { number } Found.STATUS_CODE
   */
  static get STATUS_CODE () {
    return 302
  }

  constructor (props) {
    super(props)
    this.metadata.setLocation(props.location)
  }

  componentDidMount () {
    this.metadata.setStatusCode(this.statusCode)
    this.metadata.setLocation(this.props.location)
    setTimeout(() => {
      window.location.href = this.props.location
    })
  }

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
