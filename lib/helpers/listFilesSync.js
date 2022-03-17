const fs = require('fs')
const path = require('path')
const { getValue, castToArray } = require('@adrenalin/helpers.js')

module.exports = function listFilesSync (dir, opts = {}) {
  const ext = castToArray(getValue(opts || {}, 'ext'))
    .map(e => e.replace(/^\.?/, '.'))

  let results = []

  fs.readdirSync(dir).forEach((file) => {
    file = path.join(dir, file)
    const stat = fs.statSync(file)

    if (stat.isDirectory()) {
      results = results.concat(listFilesSync(file, opts))
      return null
    }

    if (ext.length && !ext.includes(path.extname(file))) {
      return null
    }

    results.push(file)
  })

  return results
}
