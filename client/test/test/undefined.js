import React from 'react'
import Component from '../../lib/component'

module.exports = class TestUndefined extends Component {
  render () {
    return (
      <p>
        {this.callUndefinedFunction()}
      </p>
    )
  }
}
