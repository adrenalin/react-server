const createStore = require('../lib/store')
const store = createStore('Notifications', {
  listItems: {
    uri: '/api/notifications',
    keys: ['notifications'],
    success: 'listSuccess'
  }
})

module.exports = store
