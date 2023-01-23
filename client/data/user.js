const createStore = require('../lib/store')
const store = createStore('User', {
  getUser: {
    uri: '/api/user',
    keys: ['user'],
    loading: 'getItem',
    success: 'getSuccess'
  }
})

module.exports = store
