import React from 'react'
import {
  Container,
  Row,
  Col
} from 'reactstrap'
import Widget from '../widgets'
import ApplicationStore from '../data/application/store'

export default class Footer extends Widget {
  state = {
    site: ApplicationStore.getState().site
  }

  render () {
    const d = new Date()
    const currentYear = d.getFullYear()

    const site = this.state.site || {}
    const provider = site.provider || 'Kemijärvi'

    return (
      <footer id='footer'>
        <div>
          <Container>
            <Row>
              <Col className='py-4'>
                <span className='copyright copyrights-year'>Copyright &copy; {currentYear} {provider}.</span>
              </Col>
            </Row>
          </Container>
        </div>
      </footer>
    )
  }
}
