const { expect } = require('chai')
const { Validator } = require('jsonschema')
const errors = require('@adrenalin/errors')
const init = require('../../../init')

const errorRouter = require('../../../../routers/renderers/errors/api')

describe('routers/renderers/api', () => {
  let app, callback
  const testUrl = '/test/routers/renderers/errors/api'

  before(async () => {
    app = await init()
    app.use(testUrl, (req, res, next) => {
      callback(req, res, next)
    })

    app.use(testUrl, errorRouter(app))
  })

  it('should return error with a default status code', async () => {
    const errorMessage = 'errorMessage'

    callback = (req, res, next) => {
      next(new Error(errorMessage))
    }

    const response = await app.tests.requests.basic
      .get(testUrl)
      .expect(500)

    expect(response.body.status).to.eql('error')
    expect(response.body.code).to.eql(500)
    expect(response.body.error).to.eql(errorMessage)
  })

  it('should return error with a custom status code', async () => {
    const errorMessage = 'errorMessage'

    callback = (req, res, next) => {
      next(new errors.BadRequest(errorMessage))
    }

    const response = await app.tests.requests.basic
      .get(testUrl)
      .expect(400)

    expect(response.body.status).to.eql('error')
    expect(response.body.code).to.eql(400)
    expect(response.body.error).to.eql(errorMessage)
  })

  it('should add errors and data from FormValidation error to the output', async () => {
    const e = {
      foo: 'bar'
    }

    const d = {
      bar: 'foo'
    }

    callback = (req, res, next) => {
      next(new errors.FormValidation(e, d))
    }

    const response = await app.tests.requests.basic
      .get(testUrl)

    expect(response.body.status).to.eql('error')
    expect(response.body.code).to.eql(400)
    expect(response.body.errors).to.eql(e)
    expect(response.body.data).to.eql(d)
  })

  it('should add errors and data from ValidationError to the output', async () => {
    const wrongType = 123
    const patternMismatch = 'foo'

    callback = (req, res, next) => {
      const validator = new Validator()
      const schema = {
        type: 'object',
        properties: {
          required: {
            type: 'string'
          },
          wrongType: {
            type: 'string'
          },
          patternMismatch: {
            type: 'string',
            pattern: '^a$'
          }
        },
        required: ['required']
      }

      const result = validator.validate({ wrongType, patternMismatch }, schema)
      return next(new errors.ValidationError('validationFailed', result.errors))
    }

    const response = await app.tests.requests.basic
      .get(testUrl)

    expect(response.body.status).to.eql('error')
    expect(response.body.code).to.eql(400)

    expect(response.body.errors.required).to.have.string('requires')
    expect(response.body.errors.wrongType).to.have.string('type')
    expect(response.body.errors.patternMismatch).to.have.string('pattern')

    expect(response.body.data.required).to.eql(undefined)
    expect(response.body.data.wrongType).to.eql(wrongType)
    expect(response.body.data.patternMismatch).to.eql(patternMismatch)
  })
})
