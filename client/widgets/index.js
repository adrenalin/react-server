const err = new Error()
console.warn('lib/widgets/index.js will be deprecated')
console.warn(err.stack)
module.exports = require('../lib/widget')
