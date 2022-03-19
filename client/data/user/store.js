import UserActions from './action'
import UserSource from './source'
import ModelStore from '../basemodel/store'

module.exports = ModelStore.generate('UserStore', {
  actions: UserActions,
  source: UserSource,
  key: 'user',
  listeners: {}
})
