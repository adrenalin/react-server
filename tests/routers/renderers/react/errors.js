const expect = require('expect.js')
const cheerio = require('cheerio')
const errors = require('@adrenalin/errors')
const init = require('../../../init')

const router = require('../../../../routers/renderers/react')
const langRouter = require('../../../../routers/application/lang')
const configRouter = require('../../../../routers/application/config')
const errorRouter = require('../../../../routers/renderers/errors/react')

describe('routes/lib/renderers/react:errors', () => {
  let app, callback
  const testUrl = '/tests/lib/renderers/react/errors'

  before(async () => {
    app = await init()

    app.use(testUrl, configRouter(app))
    app.use(testUrl, langRouter(app))
    app.use(testUrl, (req, res, next) => {
      callback(req, res, next)
    })
    app.use(testUrl, router(app))
    app.use(testUrl, errorRouter(app))
  })

  beforeEach(async () => {
    callback = (req, res, next) => {
      next()
    }
  })

  it('should render error page when React throws an unhandled render error', async () => {
    const lang = app.config.get('react.languages', ['fi'])[0]
    const url = `${testUrl}/${lang}/undefined`

    const response = await app.tests.requests.create()
      .get(url)
      .expect(500)

    expect(response.text).to.contain(testUrl)
  })

  it('should receive form validation errors', async () => {
    const lang = app.config.get('react.languages', ['fi'])[0]
    const error = 'Bad Request'
    const errs = {
      foo: 'error 1',
      bar: 'error 2'
    }
    const data = {
      foo: 1,
      bar: 2
    }

    callback = (req, res, next) => {
      const err = new errors.FormValidation(errs, data)
      next(err)
    }

    const response = await app.tests.requests.create()
      .get(`${testUrl}/${lang}/formvalidation`)
      .expect(400)

    const $ = cheerio.load(response.text)
    const stored = JSON.parse($('#errorStore').text())
    expect(stored).to.eql({ error, errors: errs, data })
  })
})
