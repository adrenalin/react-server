// const debug = require('debug')('NotificationListActions')

export default require('../baselist/action')
  .generate('NotificationListActions', {
    updateItem (model) {
      return model
    }
  })
