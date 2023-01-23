const alt = require('../lib/alt')

class ErrorStore {
  constructor () {
    this.on('bootstrap', () => {
      // debug('bootstrapping', this.csrf, this.config);
    })
  }
}

module.exports = alt.createStore(ErrorStore, 'ErrorStore')
