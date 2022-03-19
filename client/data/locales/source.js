import SourceBuilder from '../builder'
import LocalesActions from './action'

module.exports = SourceBuilder.build({
  name: 'LocalesSource',
  actions: {
    base: LocalesActions,
    error: LocalesActions.requestFailed
  },
  methods: {
    fetchItem: {
      remote: {
        method: 'get',
        uri: '/api/locales',
        response: {
          key: 'locales'
        }
      },
      local: null,
      actions: {
        success: LocalesActions.updateSuccess
      }
    }
  }
})
