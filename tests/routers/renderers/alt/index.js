const expect = require('expect.js')
const init = require('../../../init')

const altRouter = require('../../../../routers/renderers/alt')

describe('routes/lib/renderers/alt', () => {
  let app, callback
  const testUrl = '/tests/routers/renderers/alt'

  before(async () => {
    app = await init()
    app.use(testUrl, (req, res, next) => {
      callback(req, res, next)
    })

    app.use(testUrl, altRouter(app, 'Scalar'))
    app.use(testUrl, altRouter(app, ['Array']))
  })

  it('should return a scalar store name', (done) => {
    const value = {
      scalar: true
    }

    callback = (req, res, next) => {
      res.locals.data.ScalarStore = value
      next()
    }

    app.tests.requests.basic
      .get(testUrl)
      .expect(200)
      .then((response) => {
        expect(response.body.scalar).to.eql(value.scalar)
        done()
      })
      .catch(done)
  })

  it('should return an array store name', (done) => {
    const value = {
      array: true
    }

    callback = (req, res, next) => {
      res.locals.data.ArrayStore = value
      next()
    }

    app.tests.requests.basic
      .get(testUrl)
      .expect(200)
      .then((response) => {
        expect(response.body.array).to.eql(value.array)
        done()
      })
      .catch(done)
  })

  it('should return ErrorStore with no status code', (done) => {
    const value = {
      error: true
    }

    callback = (req, res, next) => {
      res.locals.data.ErrorStore = value
      next()
    }

    app.tests.requests.basic
      .get(testUrl)
      .expect(400)
      .then((response) => {
        expect(response.body.error).to.eql(value.error)
        done()
      })
      .catch(done)
  })

  it('should return ErrorStore with status code', (done) => {
    const value = {
      error: true,
      code: 409
    }

    callback = (req, res, next) => {
      res.locals.data.ErrorStore = value
      next()
    }

    app.tests.requests.basic
      .get(testUrl)
      .expect(value.code)
      .then((response) => {
        expect(response.body.error).to.eql(value.error)
        done()
      })
      .catch(done)
  })
})
