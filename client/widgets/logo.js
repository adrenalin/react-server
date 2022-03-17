import React from 'react'
import { withRouter } from 'react-router'
import Widget from './'
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

  render () {
    const src = this.config.get('site.logo', 'visitkemijarvi.svg')
    const title = this.config.get('site.title', 'Kemijärvi')

    return (
      <Link to='/'>
        <Img src={src} alt={title} />
      </Link>
    )
  }
}

module.exports = withRouter(Logo)
