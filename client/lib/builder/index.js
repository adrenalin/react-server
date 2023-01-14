const request = require('../request')
const actions = require('./actions')
const buildSource = require('./source')
const buildStore = require('./store')

createStore.request = request
createStore.buildSource = buildSource
createStore.buildStore = buildStore
createStore.getActions = actions.getActions
createStore.getModelActions = actions.getModelActions
createStore.getListActions = actions.getListActions

const types = {
  '': actions.getActions,
  list: actions.getListActions,
  model: actions.getModelActions
}

function createStore (name, params) {
  const actions = types[params.type || ''](name)
  const source = buildSource(name, actions, params.methods || {}, params.options)
  const store = buildStore(source)

  return {
    [`${name}Actions`]: actions,
    [`${name}Source`]: source,
    [`${name}Store`]: store
  }
}

module.exports = createStore
