import React from 'react'
import Component from './component'

/**
 * @class Widget
 * @implements @Component
 */
module.exports = class Widget extends Component {
  /**
   * Default widget proptypes
   *
   * @const { object } Widget.propTypes
   */
  static get propTypes () {
    return {
      id: Widget.PropTypes.string,
      className: Widget.PropTypes.string,
      children: Widget.PropTypes.child,
      onClick: Widget.PropTypes.func
    }
  }

  /**
   * Default widget className
   *
   * @const { object } Widget.DEFAULT_CLASSNAME
   */
  static get DEFAULT_CLASSNAME () {
    return null
  }

  /**
   * Get widget class name
   *
   * @method Widget.getWidgetClassName
   * @return { string }               Class name
   */
  getWidgetClassName () {
    return `${this.constructor.name.toLowerCase()}-widget`
  }

  /**
   * Get widget class name
   *
   * @method Widget.getClassName
   * @return { string }               Class name
   */
  getClassName () {
    const classes = [this.getWidgetClassName()]

    if (this.constructor.DEFAULT_CLASSNAME) {
      classes.push(this.constructor.DEFAULT_CLASSNAME)
    }

    if (this.props.className) {
      classes.push(this.props.className)
    }

    return this.helpers.getClassName(classes, this.getExtraClasses())
  }

  /**
   * Get extra classes that might be tied to props or state
   *
   * @method Widget.getExtraClasses
   * @return { string }               Extra classes
   */
  getExtraClasses () {
    return ''
  }

  /**
   * Get common properties for the context. This is a helper function that
   * is mostly used to inject id, title, class name etc. generic properties
   * to the widget container.
   *
   * @method Widget.getCommonProperties
   * @return { object }               Props as key-value pairs
   */
  getCommonProperties () {
    const copyProperties = [
      'id',
      'for',
      'title',
      'rel',
      'style',
      'title'
    ]

    const props = {}
    props.className = this.helpers.getClassName(this.getClassName())

    // Pass through all data attributes
    for (const key in this.props) {
      if (!key.match(/^data-/)) {
        continue
      }

      props[key] = this.props[key]
    }

    copyProperties.forEach((propName) => {
      if (this.props[propName] != null) {
        props[propName] = this.props[propName]
      }
    })

    return props
  }

  /**
   * Render the widget
   *
   * @method Widget.render
   * @return { React.Element }        React element
   */
  render () {
    this.logger.error('Widget', this.constructor.name, 'needs a renderer')

    return (
      <div className='widget-basic'>@TODO: {this.constructor.name} needs a renderer</div>
    )
  }
}
