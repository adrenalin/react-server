import React from 'react'
import Widget from './'

module.exports = class ImageWidget extends Widget {
  static propTypes = {
    src: Widget.PropTypes.string.isRequired,
    alt: Widget.PropTypes.string,
    width: Widget.PropTypes.number,
    height: Widget.PropTypes.number,
    className: Widget.PropTypes.string
  }

  static defaultProps = {
    alt: '',
    className: null
  }

  /**
   * Get image src attribute
   *
   * @return { mixed }               Source as a string or null if not applicable
   */
  getSrc () {
    if (!this.props.src) {
      return null
    }

    // Append local path if no protocol or absolute path was defined
    if (!this.props.src.match(/^((https?:\/)?\/|\.)/i)) {
      return `/images/${this.props.src}`
    }

    return this.props.src
  }

  render () {
    const props = {
      src: this.getSrc(this.props.src),
      alt: this.props.alt,
      width: this.props.width || undefined,
      height: this.props.height || undefined
    }

    if (this.props.className) {
      props.className = this.props.className
    }

    return (
      <img {...props} />
    )
  }
}
