import LocalesActions from './action'
import LocalesSource from './source'
import ModelStore from '../basemodel/store'

export default ModelStore.generate('LocalesStore', {
  actions: LocalesActions,
  source: LocalesSource,
  key: 'locales',
  listeners: {}
})
