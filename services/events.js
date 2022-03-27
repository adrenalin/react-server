const Service = require('./')
const events = require('../lib/events')

module.exports = class EventsService extends Service {
  static SERVICE_NAME () {
    return 'events'
  }

  /**
   * Bind event
   *
   * @param { string } eventName      Event name
   * @param { function } listener     Event listener
   * @return { Events }               This instance
   */
  on (eventName, listener) {
    events.on(eventName, listener)
    return this
  }

  /**
   * Bind event that will be triggered only once
   *
   * @param { string } eventName      Event name
   * @param { function } listener     Event listener
   * @return { Events }               This instance
   */
  once (eventName, listener) {
    events.once(eventName, listener)
    return this
  }

  /**
   * Remove event listeners or a specific listener
   *
   * @param { string } eventName      Event name
   * @param { function } [listener]   Event listener
   * @return { Events }               This instance
   */
  off (eventName, listener) {
    events.removeListener(eventName, listener)
    return this
  }

  /**
   * Bind event that will be triggered only once
   *
   * @param { string } eventName      Event name
   * @param { mixed } args            Event arguments
   * @return { Events }               This instance
   */
  emit (eventName, ...args) {
    events.emit(eventName, ...args)
    return this
  }
}
