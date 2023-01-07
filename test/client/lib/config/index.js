const { expect } = require('chai')
const { Config } = require('@vapaaradikaali/helpers.js')

describe('client/lib/config', () => {
  it('should create a config singleton', (done) => {
    const c1 = require('../../../../client/lib/config')
    const c2 = require('../../../../client/lib/config')
    expect(c1).to.equal(c2)
    expect(c1).to.be.an.instanceof(Config)
    done()
  })
})
