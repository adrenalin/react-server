import React from 'react'
import Page from '../../lib/page'
import ErrorStore from '../../data/error/store'

module.exports = class TestFormValidation extends Page {
  /**
   * Get initial state for the component
   *
   * @return { object }               Initial component state
   */
  getInitialState () {
    return {
      store: ErrorStore.getState()
    }
  }

  /**
   * Render the component
   *
   * @return { React.node }           React node for rendering
   */
  render () {
    return (
      <p id='errorStore'>
        {JSON.stringify(this.state.store)}
      </p>
    )
  }
}
