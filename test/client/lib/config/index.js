const expect = require('expect.js')
const { Config } = require('@adrenalin/helpers.js')

describe('client/lib/config', () => {
  it('should create a config singleton', (done) => {
    const c1 = require('../../../../client/lib/config')
    const c2 = require('../../../../client/lib/config')
    expect(c1).to.be(c2)
    expect(c1).to.be.a(Config)
    done()
  })
})
