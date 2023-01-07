const errors = require('@vapaaradikaali/errors')

module.exports = (app) => {
  return (err, req, res, next) => {
    res.status(err.statusCode || 500)

    const output = {
      status: 'error',
      error: err.message,
      code: err.statusCode || 500
    }

    if (err instanceof errors.FormValidation) {
      output.errors = err.errors
      output.data = err.data
    }

    if (err instanceof errors.ValidationError) {
      output.errors = {}
      output.data = {}

      err.errors.forEach((e) => {
        const path = e.name === 'required' ? e.argument : e.path.join('.')

        output.errors[path] = e.message
        output.data[path] = e.name === 'required' ? undefined : e.instance
      })
    }

    res
      .json(output)
  }
}
