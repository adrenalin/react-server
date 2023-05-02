import React from 'react'
import { Link } from 'react-router-dom'
import Widget from '../lib/widget'

module.exports = class LinkWidget extends Widget {
  static get propTypes () {
    return {
      active: Widget.PropTypes.bool,
      selected: Widget.PropTypes.bool,
      lang: Widget.PropTypes.string,
      href: Widget.PropTypes.oneOfType([
        Widget.PropTypes.string,
        Widget.PropTypes.func
      ]),
      to: Widget.PropTypes.string
    }
  }

  /**
   * Get extra classes for the component
   *
   * @return { array }                Extra classes
   */
  getExtraClasses () {
    const classes = []

    const classProps = [
      'active',
      'disabled',
      'selected'
    ]

    classProps.forEach((prop) => {
      if (this.props[prop]) {
        classes.push(prop)
      }
    })

    return classes.join(' ')
  }

  /**
   * Render the component
   *
   * @return { React.node }           React node for rendering
   */
  render () {
    const nopass = [
      'active',
      'selected',
      'children',
      'className',
      'disabled'
    ]

    const props = this.helpers.copyObject(this.props)

    if (this.lang && props.to != null) {
      props.to = `/${this.lang}${props.to === '/' ? '' : props.to}`.replace(/^\/\//, '/')
    }

    nopass.forEach((key) => {
      delete props[key]
    })

    props.className = this.getClassName()

    if (this.props.disabled) {
      delete props.to
      delete props.href

      return (
        <a {...props}>
          {this.props.children}
        </a>
      )
    }

    if (props.href) {
      const href = typeof props.href === 'function' ? props.href.bind(this)() : props.href
      delete props.href

      return (
        <a {...props} href={href}>
          {this.props.children}
        </a>
      )
    }

    return (
      <Link {...props}>
        {this.props.children}
      </Link>
    )
  }
}
