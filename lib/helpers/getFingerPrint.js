const path = require('path')
const { exec } = require('child_process')

let fingerprint

module.exports = () => {
  return new Promise((resolve, reject) => {
    if (fingerprint) {
      return resolve(fingerprint)
    }

    const root = path.join(__dirname, '..', '..')
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
