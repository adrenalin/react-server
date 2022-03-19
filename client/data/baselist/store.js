import alt from '../../lib/alt'
const _debugger = require('debug')

module.exports = {
  generate: function generate (storeName, structure = {}) {
    const debug = _debugger(storeName)

    if (!structure.actions) {
      throw new Error(`no actions defined for ListStore ${storeName}`)
    }
    if (!structure.source) {
      throw new Error(`no source defined for ListStore ${storeName}`)
    }
    const responseKey = structure.key || 'items'

    const listeners = {
      handleFetchItems: structure.actions.FETCH_ITEMS,
      handleUpdateItems: structure.actions.UPDATE_ITEMS,
      handleRemoveItem: structure.actions.REMOVE_ITEM,
      handleRemoveSuccess: structure.actions.REMOVE_SUCCESS,
      handleRequestFailed: structure.actions.REQUEST_FAILED
    }

    if (structure.listeners) {
      for (const name in structure.listeners) {
        const definition = structure.listeners[name]
        listeners[name] = definition.action
      }
    }

    const store = class CommonListStore {
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

        this[responseKey] = []
        this.error = null
        this.removed = false

        const publicMethods = {
          getItem: this.getItem
        }

        if (structure.publicMethods) {
          for (const name in structure.publicMethods) {
            const method = structure.publicMethods[name]
            publicMethods[name] = method.bind(this)
          }
        }

        this.exportPublicMethods(publicMethods)

        this.exportAsync(structure.source)
      }

      getItem (id) {
        debug('getItem', id)
        const items = this.getState()[responseKey]
        for (const item of items) {
          if (item.id === id) {
            return item
          }
        }
        return null
      }

      handleFetchItems () {
        // debug('handleFetchItems')
        this[responseKey] = []
        this.error = null
        this.removed = false
      }

      handleUpdateItems (items) {
        // debug('handleUpdateItems', items)
        this[responseKey] = items
        this.error = null
        this.removed = false
      }

      handleRemoveItem (id) {
        // debug('handleRemoveItem', id)
        this.error = null
        if (!this.getInstance().isLoading()) {
          setTimeout(() => {
            this.getInstance().removeItem(id)
          })
        }
      }

      handleRemoveSuccess (id) {
        // debug('handleRemoveSuccess', id)
        this.removed = true
        this.error = null
        this.emitChange()
      }

      handleRequestFailed (error) {
        debug('handleRequestFailed', error)
        this.error = error
        this.removed = false
      }
    }

    return alt.createStore(store, storeName)
  }
}
