const { typecastString } = require('@adrenalin/helpers.js')

exports.merge = function merge (...argv) {
  const target = Object.assign({}, argv.shift())

  argv.forEach((a) => {
    try {
      for (const key in a) {
        const value = a[key]
        if (a.hasOwnProperty(key)) { // eslint-disable-line no-prototype-builtins
          if (Array.isArray(target[key])) {
            target[key] = target[key].concat(value)
            continue
          }

          if (typeof target[key] === 'object' && typeof target[key] !== 'undefined' && target[key] !== null) {
            target[key] = merge(target[key], value)
            continue
          }

          target[key] = value
        }
      }
    } catch (err) {
      console.error('Could not merge', ...argv)
    }
  })

  return target
}
