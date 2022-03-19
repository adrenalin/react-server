import React from 'react'
import Component from '../../lib/component'

module.exports = class Test extends Component {
  /**
   * Get page title
   *
   * @return { string|array }         String or array of strings
   */
  getPageTitle () {
    return ['testPageTitle']
  }

  /**
   * Get page description
   *
   * @return { string }               Page description
   */
  getPageDescription () {
    return 'testPageDescription'
  }

  /**
   * Initialize the component
   */
  onInitialize () {
    super.onInitialize()
    const image = this.config.get('tests.lib.react.metadata.image')

    if (image) {
      this.metadata.addImage(image)
    }
  }

  /**
   * Render the component
   *
   * @return { ReactChild }           React child for rendering
   */
  render () {
    return (
      <p>
        TestRender
      </p>
    )
  }
}
