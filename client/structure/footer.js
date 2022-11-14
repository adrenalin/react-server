import React from 'react'
import {
  Container,
  Row,
  Col
} from 'reactstrap'
import Widget from '../widgets'
import ApplicationStore from '../data/application/store'

module.exports = class Footer extends Widget {
  render () {
    const d = new Date()
    const currentYear = d.getFullYear()

    const provider = this.config.get('site.provider')

    return (
      <footer id='footer'>
        <div>
          <Container>
            <Row>
              <Col className='py-4'>
                <span className='copyright copyrights-year'>Copyright &copy; {currentYear} {provider}</span>
              </Col>
            </Row>
          </Container>
        </div>
      </footer>
    )
  }
}
