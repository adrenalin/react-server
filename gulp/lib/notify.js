const notifier = require('node-notifier')
const config = require('../config')

module.exports = function notify (...args) {
  if (!config.get('notifier')) {
    return
  }

  notifier.notify(...args)
}
