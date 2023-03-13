const path = require('path')
const { Worker } = require('node:worker_threads')

const worker = new Worker(path.join(__dirname, 'workers'))
module.exports = worker
