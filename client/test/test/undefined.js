import React from 'react'
import Component from '../../lib/component'

export default class TestUndefined extends Component {
  render () {
    return (
      <p>
        {this.callUndefinedFunction()}
      </p>
    )
  }
}
