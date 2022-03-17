import SourceBuilder from '../builder'
import UserActions from './action'

export default SourceBuilder.build({
  name: 'UserSource',
  actions: {
    base: UserActions,
    error: UserActions.requestFailed
  },
  methods: {
    fetchItem: {
      remote: {
        method: 'get',
        cache: 0,
        uri: '/api/user',
        params: (state, args) => {
          return {
            user: args[0]
          }
        },
        response: {
          key: 'user'
        }
      },
      local: null,
      actions: {
        success: UserActions.updateSuccess
      }
    }
  }
})
