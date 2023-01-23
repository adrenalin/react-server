import React from 'react'
import {
  Col,
  Container,
  Row
} from 'reactstrap'
import DefaultError from '../errors/defaulterror'

/**
 * HTTP/1.1 403 Forbidden page
 *
 * @class Forbidden
 * @param { object } props            Component props
 */
module.exports = class Forbidden extends DefaultError {
  /**
   * Status code
   *
   * @const { number } Forbidden.STATUS_CODE
   */
  static get STATUS_CODE () {
    return 403
  }

  static get propTypes () {
    return {
      roles: DefaultError.PropTypes.array
    }
  }

  /**
   * Render required roles list
   *
   * @return { React.node }           React node for rendering
   */
  renderRequiredRoles () {
    if (!this.props.roles || !this.props.roles.length) {
      return (
        <p className='mb-0'>
          {this.l10n.get('accountNotAuthorized')}
        </p>
      )
    }

    const messages = [
      (
        <p key='main'>
          {this.l10n.get('accountNotAuthorized')}
        </p>
      )
    ]

    if (this.props.roles.length === 1) {
      messages.push((
        <p className='mb-0' key='role'>
          {this.l10n.get('requiredRoleS', `${this.props.roles[0]}RoleLabel`)}
        </p>
      ))

      return messages
    }

    messages.push((
      <p key='p1'>
        {this.l10n.get('requiredOneOfRoles')}
      </p>
    ))

    messages.push((
      <ul key='list' className='mb-0'>
        {this.props.roles.map((role, i) => {
          return (
            <li key={`required-role-${i}`}>{this.l10n.get(`${role}RoleLabel`)}</li>
          )
        })}
      </ul>
    ))

    return messages
  }

  /**
   * Render the component
   *
   * @return { React.node }           React node for rendering
   */
  render () {
    return (
      <Container>
        <h1>{this.l10n.get('errorTitle403')}</h1>
        <Row>
          <Col className='content rounded-md p-2 p-lg-3 mb-4'>
            {this.renderRequiredRoles()}
          </Col>
        </Row>
      </Container>
    )
  }
}
