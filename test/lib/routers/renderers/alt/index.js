const { expect } = require('chai')
const request = require('supertest')
const init = require('../../../../init')

const altRouter = require('../../../../../lib/routers/renderers/alt')

describe('routers/renderers/alt', () => {
  let app, callback
  const testUrl = '/test/lib/routers/renderers/alt'

  before(async () => {
    app = await init()
    app.use(testUrl, (req, res, next) => {
      callback(req, res, next)
    })

    app.use(testUrl, altRouter(app, 'Scalar'))
    app.use(testUrl, altRouter(app, ['Array']))
  })

  it('should return a scalar store name', async () => {
    const value = {
      scalar: true
    }

    callback = (req, res, next) => {
      res.locals.data.ScalarStore = value
      next()
    }

    const response = await request(app)
      .get(testUrl)
      .expect(200)

    expect(response.body.scalar).to.eql(value.scalar)
  })

  it('should return an array store name', async () => {
    const value = {
      array: true
    }

    callback = (req, res, next) => {
      res.locals.data.ArrayStore = value
      next()
    }

    const response = await request(app)
      .get(testUrl)
      .expect(200)

    expect(response.body.array).to.eql(value.array)
  })

  it('should return ErrorStore with no status code',  async () => {
    const value = {
      error: true
    }

    callback = (req, res, next) => {
      res.locals.data.ErrorStore = value
      next()
    }

    const response = await request(app)
      .get(testUrl)
      .expect(400)

    expect(response.body.error).to.eql(value.error)
  })

  it('should return ErrorStore with status code', async () => {
    const value = {
      error: true,
      code: 409
    }

    callback = (req, res, next) => {
      res.locals.data.ErrorStore = value
      next()
    }

    const response = await request(app)
      .get(testUrl)
      .expect(value.code)

    expect(response.body.error).to.eql(value.error)
  })
})
