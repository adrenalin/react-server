const express = require('express')
const errors = require('@vapaaradikaali/errors')
const { getValue } = require('@vapaaradikaali/helpers.js')

module.exports = (app, opts) => {
  const router = express.Router()
  opts = opts || {}
  const source = opts.source

  if (!source) {
    throw new Error('Option "source" missing')
  }

  router.use(express.static(source))

  router.use((req, res, next) => {
    if (getValue(opts, 'fallthrough', true)) {
      return next()
    }

    return next(new errors.NotFound('Page not found'))
  })

  return router
}
