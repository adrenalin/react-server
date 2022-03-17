import alt from '../../lib/alt'
const _debugger = require('debug')

export default {
  generate: function generate (storeName, structure = {}) {
    const debug = _debugger(storeName)

    if (!structure.actions) {
      throw new Error(`no actions defined for ModelStore ${storeName}`)
    }
    if (!structure.source) {
      throw new Error(`no source defined for ModelStore ${storeName}`)
    }
    const responseKey = structure.key || 'items'

    const listeners = {
      handleCreateItem: structure.actions.CREATE_ITEM,
      handleCreateSuccess: structure.actions.CREATE_SUCCESS,
      handleFetchItem: structure.actions.UPDATE_ITEM,
      handleFetchSuccess: structure.actions.UPDATE_ITEM,
      handleUpdateItem: structure.actions.UPDATE_ITEM,
      handleUpdateSuccess: structure.actions.UPDATE_SUCCESS,
      handleRequestFailed: structure.actions.REQUEST_FAILED
    }

    if (structure.listeners) {
      for (const name in structure.listeners) {
        const definition = structure.listeners[name]
        listeners[name] = definition.action
      }
    }

    const store = class CommonModelStore {
      constructor () {
        this.debug = debug

        this.on('bootstrap', () => {
          // debug('bootstrapping')
        })

        if (structure.listeners) {
          for (const name in structure.listeners) {
            const definition = structure.listeners[name]
            this[name] = definition.method.bind(this)
          }
        }

        this.bindListeners(listeners)

        this[responseKey] = null
        this.created = false
        this.error = null

        if (structure.publicMethods) {
          const publicMethods = {}
          for (const name in structure.publicMethods) {
            const method = structure.publicMethods[name]
            publicMethods[name] = method.bind(this)
          }
          this.exportPublicMethods(publicMethods)
        }

        this.exportAsync(structure.source)
      }

      handleCreateItem (model) {
        // debug('handleCreateItem', model)
        this.error = null
        this[responseKey] = null
        this.created = null
        this.creating = true
        if (!this.getInstance().isLoading()) {
          setTimeout(() => {
            this.getInstance().createItem(model)
          })
        }
      }

      handleCreateSuccess (model) {
        // debug('handleCreateSuccess', model)
        this.error = null
        this[responseKey] = model
        this.created = true
      }

      handleUpdateItem (model) {
        // debug('handleUpdateItem', model)
        this.error = null
        this.creating = false
        if (!this.getInstance().isLoading()) {
          setTimeout(() => {
            this.getInstance().updateItem(model)
          })
        }
      }

      handleUpdateSuccess (model) {
        // debug('handleUpdateSuccess', model)
        this.error = null
        this[responseKey] = model

        if (this.creating) {
          this.created = true
        } else {
          this.created = false
        }
      }

      handleFetchItem (model) {
        // debug('handleUpdateItem', model)
        this.error = null
        this.creating = false
        if (!this.getInstance().isLoading()) {
          setTimeout(() => {
            this.getInstance().updateItem(model)
          })
        }
      }

      handleFetchSuccess (model) {
        // debug('handleUpdateSuccess', model)
        this.error = null
        this[responseKey] = model
        this.created = false
      }

      handleRequestFailed (error) {
        debug('handleRequestFailed', error)
        this.error = error
        this.created = false
      }
    }

    return alt.createStore(store, storeName)
  }
}
