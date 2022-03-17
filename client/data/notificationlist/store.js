import NotificationListActions from './action'
import NotificationListSource from './source'
import ListStore from '../baselist/store'

export default ListStore.generate('NotificationListStore', {
  actions: NotificationListActions,
  source: NotificationListSource,
  key: 'notifications',
  listeners: {
    handleUpdateItem: {
      action: NotificationListActions.UPDATE_ITEM,
      method: function handleUpdateItem (model) {
        this.error = null
        if (!this.getInstance().isLoading()) {
          setTimeout(() => {
            this.getInstance().updateItem(model)
          })
        }
      }
    }
  }
})
