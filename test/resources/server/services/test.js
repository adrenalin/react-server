const Service = require('../../../../services')

module.exports = class TestService extends Service {
  static get SERVICE_NAME () {
    return 'test'
  }

  async register () {}
}
