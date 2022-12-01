const path = require('path')
const { exec } = require('child_process')

let fingerprint

module.exports = (app) => {
  const getRoot = () => {
    if (app && app.APPLICATION_ROOT) {
      return app.APPLICATION_ROOT
    }

    return path.join(__dirname, '..', '..')
  }

  return new Promise((resolve, reject) => {
    if (fingerprint) {
      return resolve(fingerprint)
    }

    const root = getRoot()

    exec(`cd ${root} && git log --pretty=format:'%h' -n 1`, (err, res) => {
      /* istanbul ignore if rethrow error for async handling */
      if (err) {
        fingerprint = (new Date()).toISOString().substr(12)
        return fingerprint
      }

      fingerprint = res
      resolve(res)
    })
  })
}
