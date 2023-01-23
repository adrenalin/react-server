const createStore = require('../lib/store')
const store = createStore('Locales', {
  listItems: {
    uri: '/api/locales',
    keys: ['locales'],
    success: 'listSuccess'
  }
})

module.exports = store
