const Logger = require('@adrenalin/logger')
const express = require('express')

module.exports = (app, storeNames) => {
  const router = express.Router()
  const logger = new Logger('/routers/renderers/alt')
  logger.setLevel(3)

  storeNames = Array.isArray(storeNames) ? storeNames : [storeNames]

  storeNames.forEach((storeName, i) => {
    if (!storeName.match(/Store$/)) {
      storeNames[i] = `${storeName}Store`
    }
  })

  router.use((req, res, next) => {
    const data = {}

    for (let i = 0; i < storeNames.length; i++) {
      const storeName = storeNames[i]

      if (res.locals.data[storeName]) {
        for (const k in res.locals.data[storeName]) {
          data[k] = res.locals.data[storeName][k]
        }
      }
    }

    if (Object.keys(data).length) {
      return res
        .json({
          status: 'ok',
          ...data
        })
    }

    if (res.locals.data.ErrorStore) {
      const values = res.locals.data.ErrorStore

      return res
        .status(values.code || 400)
        .json(values)
    }

    return next()
  })

  return router
}
