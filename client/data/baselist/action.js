const { merge } = require('../../lib/helpers')
const alt = require('../../lib/alt')

module.exports = {
  generate: function generate (name, definitions = {}) {
    const actions = merge({}, {
      updateItems: (items) => {
        return items
      },
      fetchItems: (query) => {
        return query
      },
      removeItem: (id) => {
        return id
      },
      removeSuccess: (id) => {
        return id
      },
      requestFailed: (error) => {
        return error
      }
    }, definitions || {})

    return alt.createActions(actions)
  }
}
