import UserActions from './action'
import UserSource from './source'
import ModelStore from '../basemodel/store'

export default ModelStore.generate('UserStore', {
  actions: UserActions,
  source: UserSource,
  key: 'user',
  listeners: {}
})
