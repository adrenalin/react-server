const LocalesActions = require('./action')
const LocalesSource = require('./source')
const ModelStore = require('../basemodel/store')

module.exports = ModelStore.generate('LocalesStore', {
  actions: LocalesActions,
  source: LocalesSource,
  key: 'locales',
  listeners: {}
})
