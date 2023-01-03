const Service = require('../../../../services')

module.exports = class NameFromClassPropertyService extends Service {
  static get SERVICE_NAME () {
    return 'classproperty'
  }

  async register () {}
}
