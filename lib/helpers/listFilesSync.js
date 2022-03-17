const fs = require('fs')
const path = require('path')

module.exports = function listFilesSync (dir, opts = {}) {
  if (opts.ext) {
    if (!Array.isArray(opts.ext)) {
      opts.ext = [opts.ext]
    }
  }

  if (!fs.statSync(dir)) {
    throw new Error('Path not found')
  }

  let results = []

  fs.readdirSync(dir).forEach((file) => {
    file = path.join(dir, file)
    const stat = fs.statSync(file)

    if (stat.isDirectory()) {
      results = results.concat(listFilesSync(file, opts))
      return null
    }

    if (opts.ext && !(opts.ext.indexOf(path.extname(file)) !== -1)) {
      return null
    }

    results.push(file)
  })

  return results
}
