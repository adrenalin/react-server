const Logger = require('@vapaaradikaali/logger')
const { Source } = require('./source')
const { InvalidArgument } = require('@vapaaradikaali/errors')
const alt = require('../alt')

const cached = {}

function buildStore (source) {
  if (!(source instanceof Source)) {
    throw new InvalidArgument('buildStore requires a Source as its first argument')
  }

  const storeName = source.constructor.name.replace(/(Source)?$/, 'Store')
  const logger = new Logger(storeName)
  logger.setLevel(5)

  if (cached[storeName]) {
    logger.log('Use cached store', storeName)
    return cached[storeName]
  }

  const listeners = {}
  const actions = source.constructor.actions
  const responseKeys = source.constructor.responseKeys || new Set(['item', 'items'])

  const defer = async (cb) => {
    cb()
  }

  for (const key in actions) {
    if (!key.match(/^[A-Z]+(_[A-Z]+)+$/)) {
      continue
    }

    const ref = actions[key].replace(/^.+\.([a-z])/, (full, firstLetter) => {
      return `handle${firstLetter.toUpperCase()}`
    })

    listeners[ref] = actions[key]
  }

  const store = class Store {
    static get name () {
      /* istanbul ignore next constructor name for context readability */
      return storeName
    }

    constructor () {
      this.on('bootstrap', () => {})

      if (source.listeners) {
        for (const key in source.listeners) {
          logger.log('Register listener', key)
          this[key] = source.listeners.method.bind(this)
          logger.debug('Registered listener', key)
        }
      }

      this.bindListeners(listeners)
      this.resetModel()

      if (source.publicMethods) {
        const methods = {}

        for (const key in source.publicMethods) {
          methods[key] = source.publicMethods[key].bind(this)
        }

        this.exportPublicMethods(methods)
      }

      this.exportAsync(source)
    }

    /**
     * Reset model
     *
     * @private
     * @param { mixed } [error=null]  Received error
     */
    resetModel (error = null) {
      logger.log('resetModel')
      this.created = false
      this.error = error
      responseKeys.forEach((k) => {
        logger.debug('Set', k, 'to null')
        this[k] = null
      })
    }

    /**
     * Set model
     *
     * @private
     * @param { object } model        Received model
     */
    setModel (model) {
      logger.log('setModel', model)
      this.error = null
      this.creating = false

      for (const key in model) {
        if (responseKeys.has(key)) {
          this[key] = model[key]
        }
      }

      logger.debug('Emit change')
    }

    /**
     * Handle create item
     *
     * @private
     * @param { object } model        Received model
     */
    handleCreateItem (model) {
      logger.log('handleCreateItem', model)
      this.resetModel()
      this.created = null
      this.creating = true

      if (!this.getInstance().isLoading()) {
        logger.log('handleCreateItem not loading, pass to createItem', model)
        defer(() => this.getInstance().createItem(model))
      }
    }

    /**
     * Handle create success
     *
     * @private
     * @param { object } model        Received model
     */
    handleCreateSuccess (model) {
      logger.log('handleCreateSuccess', model)
      this.setModel(model)
      this.created = true
    }

    /**
     * Handle update item
     *
     * @private
     * @param { object } model
     */
    handleUpdateItem (model) {
      logger.log('handleUpdateItem', model)
      this.error = null
      this.creating = false

      if (!this.getInstance().isLoading()) {
        logger.log('handleUpdateItem not loading, pass to updateItem', model)
        defer(() => this.getInstance().updateItem(model))
      }
    }

    /**
     * Handle update success
     *
     * @private
     * @param { object } model        Received model
     */
    handleUpdateSuccess (model) {
      logger.log('handleUpdateSuccess', model)
      this.created = this.creating
      this.setModel(model)
    }

    /**
     * Handle get item
     *
     * @private
     * @param { object } model        Model
     */
    handleGetItem (model) {
      logger.log('handleGetItem', model)
      this.error = null
      this.creating = false

      if (!this.getInstance().isLoading()) {
        logger.log('handleGetItem not loading, pass to getSuccess', model)
        defer(() => this.getInstance().getSuccess(model))
      }
    }

    /**
     * Handle get item success
     *
     * @private
     * @param { object } model
     */
    handleGetSuccess (model) {
      logger.log('handleGetSuccess', model)
      this.error = null
      this.setModel(model)
      this.created = false
    }

    /**
     * Handle list items
     *
     * @private
     * @param { object } model        Model
     */
    handleListItems (model) {
      logger.log('handleListItems', model)
      this.error = null
      this.creating = false

      if (!this.getInstance().isLoading()) {
        logger.log('handleListItems not loading, update items', model)
        defer(() => this.getInstance().updateItems(model))
      }
    }

    /**
     * Handle list items success
     *
     * @private
     * @param { object } model
     */
    handleListSuccess (model) {
      logger.log('handleListSuccess', model)
      this.error = null
      this.setModel(model)
      this.created = false
    }

    /**
     * Handle update items
     *
     * @private
     * @param { object } model
     */
    handleUpdateItems (model) {
      logger.log('handleUpdateItems', model)
      this.error = null
      this.creating = false
      this.removed = false

      if (!this.getInstance().isLoading()) {
        logger.log('handleUpdateItems not loading, pass to updateItems', model)
        defer(() => this.getInstance().updateItems(model))
      }
    }

    /**
     * Handle remove item
     *
     * @private
     * @param { model }
     */
    handleRemoveItem (id) {
      logger.log('handleRemoveItem', id)
      this.error = null
      this.removed = false

      if (!this.getInstance().isLoading()) {
        setTimeout(() => {
          logger.log('handleRemoveItem not loading, remove item', id)
          this.getInstance().removeItem(id)
        })
      }
    }

    /**
     * Handle remove success
     *
     * @private
     * @param { model }
     */
    handleRemoveSuccess (id) {
      logger.log('handleRemoveSuccess', id)
      this.error = null
      this.removed = true
      this.emitChange()
    }

    /**
     * Handle request failed
     *
     * @private
     * @param { Error } error         Received error
     */
    handleRequestFailed (error) {
      logger.log('handleRequestFailed', error)
      this.error = error
      this.created = false
    }
  }

  cached[storeName] = alt.createStore(store, storeName)
  // cached[storeName].store = store
  return cached[storeName]
}

module.exports = buildStore
