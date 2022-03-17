import React from 'react'
import {
  Col,
  Container,
  Row
} from 'reactstrap'
import DefaultError from './defaulterror'

export default class Forbidden extends DefaultError {
  static STATUS_CODE = 403

  static propTypes = {
    roles: DefaultError.PropTypes.array
  }

  /**
   * Render required roles list
   *
   * @return { ReactChild }           React child for rendering
   */
  renderRequiredRoles () {
    if (!this.props.roles || !this.props.roles.length) {
      return (
        <p className='mb-0'>
          {this.l10n.get('accountNotAuthorized')}
        </p>
      )
    }

    const message = [
      (
        <p key='main'>
          {this.l10n.get('accountNotAuthorized')}
        </p>
      )
    ]

    if (this.props.roles.length === 1) {
      message.push((
        <p className='mb-0' key='role'>
          {this.l10n.get('requiredRoleS', `${this.props.roles[0]}RoleLabel`)}
        </p>
      ))

      return message
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
   * @return { ReactChild }           React child for rendering
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
