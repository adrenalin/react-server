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

/**
 * Create an Alt store
 *
 * @function createStore
 * @param { string } name             Store name
 * @param { object } [methods]        Public methods
 * @param { object } [options]        Options
 * @return { AltStore }               Alt store
 */
function createStore (name, methods, options) {
  methods = methods || {}
  options = options || {}

  const actions = options.actions || types[options.type || ''](name)
  const source = buildSource(name, actions, methods, options)
  const store = buildStore(source)

  store.store = store
  store.actions = actions
  store.source = source

  return store
}

module.exports = createStore
