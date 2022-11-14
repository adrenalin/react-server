import React from 'react'
import {
  Button,
  Toast,
  ToastBody,
  ToastHeader
} from 'reactstrap'

import Widget from '../widgets'
import Icon from '../widgets/icon'
import Link from '../widgets/link'

import NotificationListStore from '../data/notificationlist/store'

module.exports = class Notifications extends Widget {
  static get STORES () {
    return [
      NotificationListStore
    ]
  }

  /**
   * Get initial state for the component
   *
   * @return { object }               Initial component state
   */
  getInitialState () {
    return {
      notifications: NotificationListStore.getState().notifications || []
    }
  }

  /**
   * Set timers for the notifications
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

    this.logger.log('created timer', notification.timer)
    return notification
  }

  /**
   * React component lifecycle event that will be triggered after the component
   * has been mounted to DOM
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
   * @param { object } notification   Notification
   * @return { array }                Notifications
   */
  onAddNotification (notification) {
    this.logger.log('add notification', notification)
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

    this.logger.log('all notifications', notifications)

    this.setState({
      notifications
    })

    return notifications
  }

  /**
   * Close a notification
   *
   * @param { object } notification   Notification
   * @return { array }                Notifications
   */
  onCloseNotification (notification) {
    this.logger.log('closeNotification', notification)
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
   */
  bindEvents () {
    super.bindEvents()

    this.logger.log('this.addNotification', this.addNotification)
    this.events.on('notifications.add', this.addNotification)
    this.events.on('notifications.close', this.closeNotification)
  }

  /**
   * Unbind component events
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
   * @param { number } statusCode     Received status code
   * @return { ReactChild }           React child for rendering
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
   * Render the component
   *
   * @return { ReactChild }           React child for rendering
   */
  render () {
    const notifications = this.helpers.castToArray(this.state.notifications)
      .filter(notification => notification)

    return (
      <div id='notifications'>
        {notifications.map((notification, i) => {
          const color = notification.color || 'success'
          return (
            <Toast
              key={i}
              isOpen
              color={color}
            >
              <ToastHeader icon={color}>
                {this.l10n.get(notification.title)}
                <Button
                  className='close'
                  color={color}
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
              </ToastHeader>
              <ToastBody>
                <p
                  className='mb-0'
                  dangerouslySetInnerHTML={{
                    __html: this.l10n.get(...this.helpers.castToArray(notification.message))
                  }}
                />
                {this.renderStatusCodeMessage(notification.statusCode)}
              </ToastBody>
            </Toast>
          )
        })}
      </div>
    )
  }
}
