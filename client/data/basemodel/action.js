import { merge } from '../../lib/helpers'
import alt from '../../lib/alt'

module.exports = {
  generate: function generate (name, definitions = {}) {
    const actions = merge({}, {
      createItem: (data) => {
        return data
      },
      createSuccess: (model) => {
        return model
      },
      fetchItem: (data) => {
        return data
      },
      fetchSuccess: (model) => {
        return model
      },
      updateItem: (data) => {
        return data
      },
      updateSuccess: (model) => {
        return model
      },
      requestFailed: (error) => {
        return error
      }
    }, definitions || {})

    return alt.createActions(actions)
  }
}
