import React from 'react'
import Component from '../../lib/component'
import ErrorStore from '../../data/error/store'

export default class TestFormValidation extends Component {
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
   * @return { ReactChild }           React child for rendering
   */
  render () {
    return (
      <p id='errorStore'>
        {JSON.stringify(this.state.store)}
      </p>
    )
  }
}
