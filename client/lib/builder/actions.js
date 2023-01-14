const alt = require('../alt')

const cached = {}

const modelActions = {
  createItem: (data) => {
    return data
  },
  createSuccess: (model) => {
    return (dispatch) => {
      setTimeout(() => {
        dispatch(model)
      })
    }
  },
  getItem: (data) => {
    return data
  },
  getSuccess: (model) => {
    return (dispatch) => {
      setTimeout(() => {
        dispatch(model)
      })
    }
  },
  updateItem: (data) => {
    return data
  },
  updateSuccess: (model) => {
    return (dispatch) => {
      setTimeout(() => {
        dispatch(model)
      })
    }
  },
  requestFailed: (error) => {
    return error
  }
}

const listActions = {
  listItems: (query) => {
    return query
  },
  updateItems: (items) => {
    return (dispatch) => {
      setTimeout(() => {
        dispatch(items)
      })
    }
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
}

/**
 * Build basic model actions
 *
 * @function builder.getModelActions
 * @param { string } name             Source name
 * @param { object } [definitions]    Extra definitions
 */
exports.getModelActions = function getModelActions (name, definitions) {
  if (cached[name]) {
    return cached[name]
  }

  definitions = definitions || {}
  const actions = {
    ...modelActions,
    ...definitions,
    name
  }

  cached[name] = alt.createActions(actions)
  return cached[name]
}

/**
 * Build basic model actions
 *
 * @function builder.getModelActions
 * @param { string } name             Source name
 * @param { object } [definitions]    Extra definitions
 */
exports.getListActions = function getListActions (name, definitions) {
  if (cached[name]) {
    return cached[name]
  }

  definitions = definitions || {}
  const actions = {
    ...listActions,
    ...definitions,
    name
  }

  cached[name] = alt.createActions(actions)
  return cached[name]
}

/**
 * Build full model actions
 *
 * @function builder.getModelActions
 * @param { string } name             Source name
 * @param { object } [definitions]    Extra definitions
 */
exports.getActions = function getActions (name, definitions) {
  if (cached[name]) {
    return cached[name]
  }

  definitions = definitions || {}
  const actions = {
    ...modelActions,
    ...listActions,
    ...definitions,
    name
  }

  cached[name] = alt.createActions(actions)
  return cached[name]
}
