const alt = require('../../lib/alt')
// const debug = require('../debugger')('ApplicationStore')

class ErrorStore {
  constructor () {
    this.on('bootstrap', () => {
      // debug('bootstrapping', this.csrf, this.config);
    })
  }
}

module.exports = alt.createStore(ErrorStore, 'ErrorStore')
