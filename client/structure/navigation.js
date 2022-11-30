import React from 'react'
import { withRouter } from 'react-router-dom'

import Widget from '../lib/widget'
import Icon from '../widgets/icon'
import Link from '../widgets/link'

import UserStore from '../data/user/store'

class Navigation extends Widget {
  static get propTypes () {
    return Widget.extendProps({
      items: Widget.PropTypes.array.isRequired
    })
  }

  getInitialState () {
    const user = UserStore.getState().user

    return {
      active: false,
      id: this.props.id || `navigation_${this.helpers.getRandomString(8)}`,
      user
    }
  }

  /**
   * Should display a navigation item
   *
   * @method Navigation#shouldDisplay
   * @param { object } item           Navigation item
   * @return { boolean }              Navigation item display status
   */
  shouldDisplay (item) {
    if (typeof item.hidden === 'function') {
      return !item.hidden.bind(this)()
    }

    const params = this.helpers.castToArray(item.hidden)

    for (let i = 0; i < params.length; i++) {
      const param = params[i].replace(/^!/, '')
      const state = !params[i].match(/^!/)

      switch (param) {
        case 'user':
          if (!this.state.user && !state) {
            return false
          }

          if (this.state.user && state) {
            return false
          }

          break

        default:
          if (this.config.get(param) && state) {
            return false
          }
      }
    }

    return true
  }

  /**
   * Bind component events
   */
  bindEvents () {
    const toggleNavi = (e) => {
      e.preventDefault()
      e.stopPropagation()

      const active = !this.state.active

      this.setState({
        active
      })

      if (!active) {
        $('body').removeClass('no-scroll')
      }

      if (active) {
        $('body').addClass('no-scroll')
      }

      return false
    }

    $(`#${this.state.id} .navigation-toggle`)
      .on('click.navigation touch.navigation', toggleNavi.bind(this))
  }

  /**
   * Unbind component events
   */
  unbindEvents () {
    $(`#${this.state.id} .navigation-toggle`)
      .off('click.navigation touch.navigation')
  }

  /**
   * Render a navigation item
   *
   * @param { object } item           Navigation item
   * @param { number } index          Navigation item index
   * @return { ReactChild }           React child for rendering
   */
  renderItem (item, index) {
    if (!this.shouldDisplay(item)) {
      return null
    }

    const props = {}

    if (item.href) {
      props.href = item.href
    }

    if (item.to) {
      props.to = item.to
    }

    props.onClick = (e) => {
      this.setState({
        active: false
      })
    }

    const classes = ['item']

    if (item.className) {
      classes.push(item.className)
    }

    if (item.active && this.props.location.pathname.substr(3).match(item.active)) {
      classes.push('active')
    }

    return (
      <Link {...props} className={classes.join(' ')} key={`navi-${index}`}>
        {this.l10n.get(item.title)}
      </Link>
    )
  }

  /**
   * Render the component
   *
   * @return { ReactChild }           React child for rendering
   */
  render () {
    const classes = ['navigation-items', 'd-lg-flex']

    if (!this.state.active) {
      classes.push('d-none')
    }

    return (
      <nav {...this.getCommonProperties()} id={this.state.id}>
        <Icon
          icon='bars'
          className='toggle d-block d-lg-none navigation-toggle'
        />
        <div className={classes.join(' ')}>
          <Icon
            icon='times'
            className='toggle d-block d-lg-none navigation-toggle'
          />
          {this.props.items.map((item, i) => {
            return this.renderItem(item, i)
          })}
          {this.props.children}
        </div>
        <div
          className={this.state.active ? 'd-none d-md-block cover navigation-toggle' : 'd-none'}
        />
      </nav>
    )
  }
}

module.exports = withRouter(Navigation)
