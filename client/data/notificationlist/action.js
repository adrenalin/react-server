// const debug = require('debug')('NotificationListActions')

module.exports = require('../baselist/action')
  .generate('NotificationListActions', {
    updateItem (model) {
      return model
    }
  })
