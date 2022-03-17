const path = require('path')

const notifier = require('node-notifier')
const debug = require('debug')('Helpers')

let sounds = true
exports.errorHandler = function errorHandler (err) {
  err.sound = 'Glass'
  return notificationHandler(err)
}

exports.successHandler = function successHandler (err) {
  // Basso, Blow, Bottle, Frog, Funk, Glass, Hero, Morse, Ping, Pop, Purr, Sosumi, Submarine, Tink
  err.sound = 'Pop'
  return notificationHandler(err)
}

const notificationHandler = exports.notificationHandler = function notificationHandler (err) {
  const sound = sounds ? err.sound || false : false

  notifier.notify({
    icon: err.icon || path.join(__dirname, 'images', 'favicon-64.png'),
    title: err.name || err.title || 'Gulp',
    message: err.message || '',
    sound: sound
  })
}

exports.getState = function getState (deps = [], label = null) {
  const state = {
    start: Date.now(),
    errors: []
  }

  deps.map((dep) => {
    if (typeof dep !== 'function') {
      debug('Not a function', dep, typeof dep)
      return null
    }

    const depState = dep()

    // Merge errors to the current state
    depState.errors.map((err) => {
      state.errors.push(err)
    })

    // Get the minimum time from the task state
    state.start = Math.min(state.start, depState.start || Date.now())
  })

  return state
}
