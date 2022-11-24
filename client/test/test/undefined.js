import React from 'react'
import Page from '../../lib/page'

module.exports = class TestUndefined extends Page {
  render () {
    return (
      <p>
        {this.callUndefinedFunction()}
      </p>
    )
  }
}
