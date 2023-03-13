const Service = require('./')
const events = require('../lib/events')

/**
 * Server events
 *
 * @class EventsService
 */
module.exports = class EventsService extends Service {
  /**
   * Events service name
   *
   * @const { string } EventsService.SERVICE_NAME
   * @default events
   */
  static get SERVICE_NAME () {
    return 'events'
  }

  /**
   * Bind event
   *
   * @method EventsService#on
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
   * @method EventsService#once
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
   * @method EventsService#off
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
   * @method EventsService#emit
   * @param { string } eventName      Event name
   * @param { mixed } args            Event arguments
   * @return { Events }               This instance
   */
  emit (eventName, ...args) {
    events.emit(eventName, ...args)
    return this
  }

  /**
   * Alias for emit
   *
   * @const { function } EventsService#trigger
   * @alias EventsService#emit
   */
  get trigger () {
    return this.emit
  }

  /**
   * Alias for on
   *
   * @const { function } EventsService#listen
   * @alias EventsService#on
   */
  get listen () {
    return this.on
  }

  /**
   * Alias for off
   *
   * @const { function } EventsService#unlisten
   * @alias EventsService#off
   */
  get unlisten () {
    return this.off
  }
}
