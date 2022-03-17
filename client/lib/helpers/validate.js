const isValidEmail = /^((([!#$%&'*+\-/=?^_`{|}~\w])|([!#$%&'*+\-/=?^_`{|}~\w][!#$%&'*+\-/=?^_`{|}~.\w]{0,}[!#$%&'*+\-/=?^_`{|}~\w]))[@]\w+([-.]\w+)*\.\w+([-.]\w+)*)$/i

/**
 * Validate input
 *
 * @param { object } values           Input values
 * @param { object } fields           Field definitions
 */
module.exports = (values, fields) => {
  const errors = {}

  for (const key in fields) {
    try {
      const field = fields[key]
      const value = values[key]

      if (field.required && !value) {
        throw new Error('required')
      }

      switch (field.type) {
        case 'email':
          if (!isValidEmail.test(String(value || ''))) {
            throw new Error('emailInvalid')
          }
          break
      }

      if (field.pattern && !field.pattern.test(String(value || ''))) {
        throw new Error('validationFailed')
      }

      if (typeof field.validate === 'function') {
        const validity = field.validate(value, values)

        if (validity === false) {
          throw new Error('validationFailed')
        }
      }
    } catch (err) {
      errors[key] = {
        err,
        message: err.message,
        args: err.args || [],
        value: values[key]
      }
    }
  }

  return errors
}
