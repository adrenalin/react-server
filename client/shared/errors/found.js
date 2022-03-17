import React from 'react'
import {
  Col,
  Container,
  Row
} from 'reactstrap'

import DefaultError from './defaulterror'

export default class Found extends DefaultError {
  static propTypes = {
    location: DefaultError.PropTypes.string.isRequired
  }

  static STATUS_CODE = 302

  constructor (props) {
    super(props)
    this.metadata.setStatusCode(this.constructor.STATUS_CODE)
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
