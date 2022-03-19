const { castToArray } = require('@adrenalin/helpers.js')
const Logger = require('@adrenalin/logger')
const events = {}

module.exports = class EventHandler {
  static LOG_LEVEL = 3

  constructor () {
    this.logger = new Logger('Events')
    this.logger.setLevel(this.constructor.LOG_LEVEL)
  }

  /**
   * Attach an event that will be triggered every time for the given event name
   *
   * @param { string } eventName      Event name
   * @param { function } method       Callback function to run
   * @return { EventHandler }         This instance for chaining
   */
  on (eventName, method) {
    events[eventName] = events[eventName] || []
    castToArray(method).forEach((m) => {
      const callback = {
        once: false,
        method: m
      }

      events[eventName].push(callback)
    })

    return this
  }

  /**
   * Attach an event that will be triggered only once for the given event name
   *
   * @param { string } eventName      Event name
   * @param { function } method       Callback function to run
   * @return { EventHandler }         This instance for chaining
   */
  once (eventName, method) {
    events[eventName] = events[eventName] || []
    castToArray(method).forEach((m) => {
      const callback = {
        once: true,
        method: m
      }

      events[eventName].push(callback)
    })

    return this
  }

  /**
   * Delete an event. All methods will be detached if a specific method
   * was not given, and matching events with prefix (e.g. `example.eventName`)
   * will be detached when the prefix is given.
   *
   * @param { string } eventName      Event name
   * @param { function } [method]     Callback function to run
   * @return { EventHandler }         This instance for chaining
   */
  off (eventName, method = null) {
    const matches = [eventName]

    // Match prefixed names
    Object.keys(events).forEach((name) => {
      const parts = name.split('.')

      if (parts[1] && parts[0] === eventName) {
        matches.push(name)
      }
    })

    matches.forEach((name) => {
      if (!events[name]) {
        return
      }

      // No method given, truncate all matches
      if (!method) {
        events[name].splice(0, events[name].length)
        return
      }

      const indexes = []

      events[name].forEach((callback, i) => {
        if (callback.method === method) {
          indexes.push(i)
        }
      })

      indexes
        .sort()
        .reverse()
        .forEach((i) => {
          events[name].splice(i, 1)
        })
    })

    return this
  }

  /**
   * Emit an event
   *
   * @param { string } eventName      Name of the event
   * @param { mixed } ...args         Event payload
   * @return { EventHandler }         This instance for chaining
   */
  emit (eventName, ...args) {
    const matches = [eventName]

    // Match prefixed names
    Object.keys(events).forEach((name) => {
      const parts = name.split('.')

      if (parts[1] && parts[1] === eventName) {
        matches.push(name)
      }
    })

    matches.forEach((name) => {
      castToArray(events[name])
        .forEach((eventHandler, i) => {
          try {
            eventHandler.method(...args)

            if (eventHandler.once) {
              this.off(name, eventHandler.method)
            }
          } catch (err) {
            console.error(name, eventHandler, err)
          }
        })
    })

    return this
  }
}
