const alt = require('../alt')

const cached = {}
const defer = (...args) => {
  return async (dispatch) => {
    dispatch(...args)
  }
}

const modelActions = exports.modelActions = {
  createItem: (data) => {
    return data
  },
  createSuccess: (model) => {
    return defer(model)
  },
  getItem: (data) => {
    return data
  },
  getSuccess: (model) => {
    return defer(model)
  },
  updateItem: (data) => {
    return data
  },
  updateSuccess: (model) => {
    return defer(model)
  },
  requestFailed: (error) => {
    return error
  }
}

const listActions = exports.listActions = {
  listItems: (model) => {
    return model
  },
  listSuccess: (items) => {
    return defer(items)
  },
  updateItems: (data) => {
    return data
  },
  updateSuccess: (models) => {
    return defer(models)
  },
  removeItem: (id) => {
    return id
  },
  removeSuccess: (id) => {
    return defer(id)
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
