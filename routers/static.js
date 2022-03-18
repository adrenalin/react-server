const express = require('express')

module.exports = (app, opts) => {
  const router = express.Router()
  opts = opts || {}
  const source = opts.source

  if (!source) {
    throw new Error('Option "source" missing')
  }

  router.use(express.static(source))

  return router
}
