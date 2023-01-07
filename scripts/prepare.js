const path = require('path')
const config = require('../gulp/config')
config.set('root', path.join(__dirname, '..'))

const buildClient = require('../gulp/tasks/buildClient')

// Build client that uses ES6 + JSX
buildClient()
