const SourceBuilder = require('../builder')
const NotificationListActions = require('./action')

module.exports = SourceBuilder.build({
  name: 'NotificationListSource',
  actions: {
    base: NotificationListActions,
    error: NotificationListActions.requestFailed
  },
  methods: {
    fetchItems: {
      remote: {
        method: 'get',
        uri: '/api/notifications',
        params: (state, args) => {
          return {
            notifications: args[0]
          }
        },
        response: {
          key: 'notifications'
        }
      },
      local: null,
      actions: {
        success: NotificationListActions.updateItems
      }
    }
  }
})
