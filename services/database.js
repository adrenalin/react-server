const errors = require('@adrenalin/errors')
// const { castToArray } = require('@adrenalin/helpers.js')
const Service = require('./')
const Database = require('../lib/database')

class DatabaseService extends Service {
  static get SERVICE_NAME () {
    return 'database'
  }

  /**
   * Register database service
   *
   * @return { DatabaseService }         This instance
   */
  async register () {
    this.db = Database.getEngine(this.app, this.config.get('services.cache.engine', 'psql'))
    await this.db.connect()

    return this
  }
}

module.exports = DatabaseService
