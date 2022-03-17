import SourceBuilder from '../builder'
import NotificationListActions from './action'

export default SourceBuilder.build({
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
