const errors = require('@adrenalin/errors')

module.exports = (app) => {
  return (err, req, res, next) => {
    res.status(err.statusCode || 500)

    const error = {
      status: 'error',
      error: err.message,
      code: err.statusCode || 500
    }

    if (err instanceof errors.FormValidation) {
      error.errors = err.errors
      error.data = err.data
    }

    res
      .json(error)
  }
}
