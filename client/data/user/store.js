const UserActions = require('./action')
const UserSource = require('./source')
const ModelStore = require('../basemodel/store')

module.exports = ModelStore.generate('UserStore', {
  actions: UserActions,
  source: UserSource,
  key: 'user',
  listeners: {}
})
