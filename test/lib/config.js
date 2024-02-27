const { expect } = require('chai')
const ServerConfig = require('@vapaaradikaali/helpers.js/lib/ServerConfig')

describe('lib/config', () => {
  it('should define a config singleton', () => {
    const c1 = require('../../lib/config')
    const c2 = require('../../lib/config')
    expect(c1).to.be.an.instanceof(ServerConfig)
    expect(c1).to.equal(c2)
  })
})