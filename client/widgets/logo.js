import React from 'react'
import { withRouter } from 'react-router-dom'
import Widget from '../lib/widget'
import Img from './image'
import Link from './link'

class Logo extends Widget {
  /**
   * Get page class for this context
   *
   * @return { mixed }               CSS class name as string or null if not applicable
   */
  getPageClass () {
    return null
  }

  /**
   * Render the component
   *
   * @return { React.node }           React node for rendering
   */
  render () {
    const src = this.config.get('site.logo')
    const title = this.config.get('site.title')

    return (
      <Link to='/'>
        <Img src={src} alt={title} />
      </Link>
    )
  }
}

module.exports = withRouter(Logo)
