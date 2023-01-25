import React from 'react'
import {
  Button,
  Toast,
  ToastBody,
  ToastHeader
} from 'reactstrap'

import Widget from '../lib/widget'
import Icon from '../widgets/icon'
import Link from '../widgets/link'

import NotificationStore from '../data/notifications'

/**
 * Notifications
 *
 * @class Notifications
 */
module.exports = class Notifications extends Widget {
  /**
   * Stores to attach to this context
   *
   * @const { array } Notifications.STORES
   */
  static get STORES () {
    return [
      NotificationStore
    ]
  }

  /**
   * Get initial state for the component
   *
   * @method Notifications#getInitialState
   * @return { object }               Initial component state
   */
  getInitialState () {
    return {
      notifications: NotificationStore.getState().notifications || []
    }
  }

  /**
   * Set timers for the notifications
   *
   * @method Notifications#createTimer
   * @param { object } notification   New notification
   * @return { object }               Notification
   */
  createTimer (notification) {
    if (!notification) {
      return null
    }

    const duration = Math.max(notification.duration, 0)
    if (!duration || notification.timer) {
      return notification
    }

    const clearNotification = () => {
      this.closeNotification(notification)
    }

    notification.timer = setTimeout(clearNotification.bind(this), notification.duration * 1000)

    this.logger.debug('created timer', notification.timer)
    return notification
  }

  /**
   * React component lifecycle event that will be triggered after the component
   * has been mounted to DOM
   *
   * @method Notifications#componentDidMount
   */
  componentDidMount () {
    const notifications = this.helpers.castToArray(this.state.notifications)
      .map((notification) => {
        return this.createTimer(notification)
      })
      .filter(notification => notification)

    this.setState({
      notifications
    })

    this.addNotification = this.onAddNotification.bind(this)
    this.closeNotification = this.onCloseNotification.bind(this)

    super.componentDidMount()
  }

  /**
   * Add a notification
   *
   * @method Notifications#onAddNotification
   * @param { object } notification   Notification
   * @return { array }                Notifications
   */
  onAddNotification (notification) {
    this.logger.debug('add notification', notification)
    const notifications = this.helpers.castToArray(this.state.notifications)

    const ids = notifications.map(notification => notification.id)

    // Update an existing notification
    if (notification.id && ids.includes(notification.id)) {
      const existing = notifications[ids.indexOf(notification.id)]

      for (const key in notification) {
        existing[key] = notification[key]
      }

      // Delete any possible existing timer
      clearTimeout(existing.timer)
      delete existing.timer
      this.createTimer(existing)
    }

    if (!notification.id || !ids.includes(notification.id)) {
      notifications.push(this.createTimer(notification))
    }

    this.logger.debug('all notifications', notifications)

    this.setState({
      notifications
    })

    return notifications
  }

  /**
   * Close a notification
   *
   * @method Notifications#onCloseNotification
   * @param { object } notification   Notification
   * @return { array }                Notifications
   */
  onCloseNotification (notification) {
    this.logger.debug('closeNotification', notification)
    const notifications = this.helpers.castToArray(this.state.notifications)

    const id = notification.id || notification
    const ids = notifications.map(n => n.id)

    if (ids.includes(id)) {
      notifications.splice(ids.indexOf(id), 1)
    }

    if (notification.timer) {
      clearTimeout(notification.timer)
    }

    if (notifications.includes(notification)) {
      notifications.splice(notifications.indexOf(notification), 1)
    }

    this.setState({
      notifications
    })

    return notifications
  }

  /**
   * Bind component events
   *
   * @method Notifications#getInitialState
   */
  bindEvents () {
    super.bindEvents()

    this.logger.debug('this.addNotification', this.addNotification)
    this.events.on('notifications.add', this.addNotification)
    this.events.on('notifications.close', this.closeNotification)
  }

  /**
   * Unbind component events
   *
   * @method Notifications#unbindEvents
   */
  unbindEvents () {
    super.unbindEvents()

    this.events.off('notifications.add', this.addNotification)
    this.events.off('notifications.close', this.closeNotification)

    this.helpers.castToArray(this.state.notifications)
      .forEach((notification) => {
        if (notification.timer) {
          clearTimeout(notification.timer)
        }
      })
  }

  /**
   * Render extra notification content by status code
   *
   * @method Notifications#renderStatusCodeMessage
   * @param { number } statusCode     Received status code
   * @return { React.node }           React node for rendering
   */
  renderStatusCodeMessage (statusCode) {
    switch (statusCode) {
      case 403:
        if (this.user) {
          return null
        }

        return (
          <p className='mt-3 mb-0'>
            <Link className='btn btn-primary' to='/login'>
              {this.l10n.get('loginButtonAction')}
            </Link>
          </p>
        )

      default:
        return null
    }
  }

  /**
   * Get default color for a notification
   *
   * @method Notifications#getDefaultColor
   * @return { string }               Default theme color
   */
  getDefaultColor () {
    return 'success'
  }

  /**
   * Get notification color
   *
   * @method Notifications#getNotificationColor
   * @param { object } notification   Notification
   * @return { string }               Notification color
   */
  getNotificationColor (notification) {
    return notification.color || this.getDefaultColor()
  }

  /**
   * Get notification class name
   *
   * @method Notifications#getNotificationColor
   * @param { object } notification   Notification
   * @return { string }               Notification class name
   */
  getNotificationClassName (notification) {
    const classes = new Set([
      `bg-${this.getNotificationColor(notification)}`,
      `text-bg-${this.getNotificationColor(notification)}`
    ])

    if (notification.className) {
      classes.add(notification.className)
    }

    return Array.from(classes).filter(c => c).join(' ')
  }

  /**
   * Render an individual notification
   *
   * @method Notifications#renderNotification
   * @param { object } notification   Notification
   * @param { number } index          Notification index
   * @return { React.Node }           React node for rendering
   */
  renderNotification (notification, index) {
    return (
      <Toast
        key={index}
        isOpen
        className={this.getNotificationClassName(notification)}
      >
        {this.renderNotificationHeader(notification)}
        {this.renderNotificationBody(notification)}
      </Toast>
    )
  }

  /**
   * Render an individual notification
   *
   * @method Notifications#renderNotificationHeader
   * @param { object } notification   Notification
   * @return { React.Node }           React node for rendering
   */
  renderNotificationHeader (notification) {
    const color = notification.color || 'success'
    return (
      <ToastHeader icon={color}>
        {this.l10n.get(notification.title)}
        {this.renderNotificationClose(notification)}
      </ToastHeader>
    )
  }

  /**
   * Render a notification body
   *
   * @method Notifications#renderNotificationBody
   * @param { object } notification   Notification
   * @return { React.Node }           React node for rendering
   */
  renderNotificationBody (notification) {
    return (
      <ToastBody>
        <p
          className='mb-0'
          dangerouslySetInnerHTML={{
            __html: this.l10n.get(...this.helpers.castToArray(notification.message))
          }}
        />
        {this.renderStatusCodeMessage(notification.statusCode)}
      </ToastBody>
    )
  }

  /**
   * Render the close button for a notification
   *
   * @method Notifications#renderNotificationClose
   * @param { object } notification   Notification
   * @return { React.Node }           React node for rendering
   */
  renderNotificationClose (notification) {
    return (
      <Button
        className='close'
        color={this.getNotificationColor(notification)}
        size='xs'
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          this.closeNotification(notification)
          return false
        }}
      >
        <Icon icon='times' set='s' />
      </Button>
    )
  }

  /**
   * Render the component
   *
   * @method Notifications#render
   * @return { React.Node }           React node for rendering
   */
  render () {
    const notifications = this.helpers.castToArray(this.state.notifications)
      .filter(notification => notification)

    return (
      <div id='notifications'>
        {notifications.map((notification, i) => this.renderNotification(notification, i))}
      </div>
    )
  }
}
