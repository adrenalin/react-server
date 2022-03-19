import LocalesActions from './action'
import LocalesSource from './source'
import ModelStore from '../basemodel/store'

module.exports = ModelStore.generate('LocalesStore', {
  actions: LocalesActions,
  source: LocalesSource,
  key: 'locales',
  listeners: {}
})
