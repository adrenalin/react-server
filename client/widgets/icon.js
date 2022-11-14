import React from 'react'
import Widget from './'

module.exports = class Icon extends Widget {
  static get propTypes () {
    return {
      ...Widget.propTypes,
      brand: Widget.PropTypes.string,
      icon: Widget.PropTypes.string,
      set: Widget.PropTypes.string,
      weight: Widget.PropTypes.string
    }
  }

  static get defaultProps () {
    return {
      set: 's'
    }
  }

  getWidgetClassName () {
    if (this.props.brand) {
      return `icon fab fa-${this.props.brand.toLowerCase()}`
    }

    return `icon fa${this.props.set} fa-${this.props.icon.toLowerCase()}`
  }

  /**
   * Get common properties for the context. This is a helper function that
   * is mostly used to inject id, title, class name etc. generic properties
   * to the widget container.
   *
   * @return { object }               Props as key-value pairs
   */
  getCommonProperties () {
    const props = super.getCommonProperties()
    const copyProperties = [
      'onClick',
      'onTouch',
      'onFocus'
    ]

    copyProperties.forEach((propName) => {
      if (this.props[propName] != null) {
        props[propName] = this.props[propName]
      }
    })

    return props
  }

  render () {
    return (
      <i {...this.getCommonProperties()} />
    )
  }
}
