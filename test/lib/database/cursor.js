const errors = require('@vapaaradikaali/errors')
const { expect } = require('chai')
const DatabaseCursor = require('../../../lib/database/cursor')

describe('lib/database/cursor', () => {
  it('should have abstract method "read"', async () => {
    try {
      const cursor = new DatabaseCursor()
      await cursor.read(5)
      throw new Error('Should have thrown a NotImplemented')
    } catch (err) {
      expect(err).to.be.an.instanceof(errors.NotImplemented)
    }
  })

  it('should have abstract method "close"', async () => {
    try {
      const cursor = new DatabaseCursor()
      await cursor.close()
      throw new Error('Should have thrown a NotImplemented')
    } catch (err) {
      expect(err).to.be.an.instanceof(errors.NotImplemented)
    }
  })
})