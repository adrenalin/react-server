const fs = require('fs')
const path = require('path')
const { expect } = require('chai')
const init = require('../init')

const router = require('../../routers/static')
const errorRouter = require('../../routers/renderers/errors/api')

describe('routers/static', () => {
  let app
  let hasFallenThrough = false
  const testUrl = '/test/routers/static'
  const testSource = path.join(__dirname, '..', 'resources', 'routers', 'static')
  const opts = {
    source: testSource
  }

  before(async () => {
    app = await init()

    app.use(testUrl, router(app, opts))
    app.use(testUrl, (req, res, next) => {
      hasFallenThrough = true
      next()
    })

    app.use(testUrl, errorRouter(app))
  })

  beforeEach(async () => {
    hasFallenThrough = false
    opts.source = testSource
    opts.fallthrough = true
  })

  it('should throw an error when attaching without source', (done) => {
    try {
      router(app)
      done(new Error('Should have thrown an error'))
    } catch (err) {
      done()
    }
  })

  it('should find a static file', async () => {
    const contents = fs.readFileSync(path.join(testSource, 'test.txt'), 'utf-8')
    const response = await app.tests.requests.create().get(`${testUrl}/test.txt`)
      .expect(200)

    expect(response.headers['content-type']).to.have.string('text/plain')
    expect(response.headers['content-encoding']).not.to.eql('gzip')
    expect(response.text).to.eql(contents)
  })

  it('should not find a file that does not exist', async () => {
    await app.tests.requests.create().get(`${testUrl}/undefined.txt`)
      .expect(404)

    expect(hasFallenThrough).to.equal(true)
  })

  it('should not fall through when fallthrough option is false', async () => {
    opts.fallthrough = false
    await app.tests.requests.create().get(`${testUrl}/undefined.txt`)
      .expect(404)

    expect(hasFallenThrough).to.equal(false)
  })
})
