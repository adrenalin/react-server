const path = require('path')
const { expect } = require('chai')
const getApplicationRoot = require('../../../lib/helpers/getApplicationRoot')

describe('lib/helpers/getApplicationRoot', () => {
  it('should get the application root from options', () => {
    const testPath = '/test/lib/helpers/getApplicationRoot'
    expect(getApplicationRoot({ applicationRoot: testPath })).to.equal(testPath)
  })

  it('should get the application root from the current working directory', () => {
    expect(getApplicationRoot()).to.eql(process.cwd())
  })
})