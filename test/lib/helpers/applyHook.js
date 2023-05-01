const path = require('path')
const { MethodNotAllowed } = require('@vapaaradikaali/errors')
const { expect } = require('chai')
const applyHook = require('../../../lib/helpers/applyHook')

describe('lib/helpers/applyHook', () => {
  const app = {
    APPLICATION_ROOT: path.join(__dirname, '../../resources/lib/helpers/applyHook')
  }

  it('should not throw an error for a hook that does not exist', async () => {
    const rval = await applyHook(app, 'module-does-not-exist')
  })

  it('should throw the original error for a hook that throws an error', async () => {
    try {
      await applyHook(app, 'throws-error')
      throw new Error('Should have thrown a MethodNotAllowed')
    } catch (err) {
      expect(err).to.be.an.instanceof(MethodNotAllowed)
    }
  })

  it('should return the hook return value', async () => {
    const rval = await applyHook(app, 'return-value')
    expect(rval).to.equal(app)
  })
})