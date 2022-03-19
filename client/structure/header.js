import React from 'react'

import Widget from '../widgets'
import Img from '../widgets/image'

module.exports = class Header extends Widget {
  /**
   * Render the component
   *
   * @return { ReactChild }           React child for rendering
   */
  render () {
    const src = this.config.get('site.logo', 'visitkemijarvi.svg')
    const title = this.config.get('site.title', 'Kemijärvi')

    return (
      <header id='header'>
        <div className='logo'>
          <a href={`/${this.lang}`}><Img src={src} alt={title} /></a>
        </div>
        {this.props.children}
      </header>
    )
  }
}
