const path = require('path')
const { exec } = require('child_process')

module.exports = () => {
  return new Promise((resolve, reject) => {
    const root = path.join(__dirname, '..', '..')
    exec(`cd ${root} && git log --pretty=format:'%h' -n 1`, (err, res) => {
      if (err) {
        return reject(err)
      }

      resolve(res)
    })
  })
}
