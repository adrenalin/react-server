const NotificationListActions = require('./action')
const NotificationListSource = require('./source')
const ListStore = require('../baselist/store')

module.exports = ListStore.generate('NotificationListStore', {
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
