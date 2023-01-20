const { expect } = require('chai')
const request = require('supertest')
const { getValue } = require('@vapaaradikaali/helpers.js')
const init = require('../../init')
const Metadata = require('../../../client/lib/metadata')

const router = require('../../../routers/application/metadata')
const altRouter = require('../../../routers/renderers/alt')
const errorRouter = require('../../../routers/renderers/errors/api')

describe('routers/application/metadata', () => {
  let app
  const testUrl = '/test/lib/application/metadata'

  let callback = (req, res, next) => {
    next()
  }

  before(async () => {
    app = await init()

    app.use(testUrl, router(app))
    app.use(testUrl, (req, res, next) => {
      callback(req, res, next)
    })
    app.use(testUrl, altRouter(app, ['Application']))
    app.use(testUrl, errorRouter(app))
  })

  it('should create a new instance for each response', async () => {
    let metadata

    callback = (req, res, next) => {
      metadata = res.metadata
      expect(metadata).to.be.an.instanceof(Metadata)
      res.json({
        status: 'ok'
      })
    }

    await request(app).get(testUrl)
      .expect(200)

    callback = (req, res, next) => {
      expect(metadata).not.to.equal(res.metadata)
      res.json({
        status: 'ok'
      })
    }

    await request(app).get(testUrl)
      .expect(200)
  })

  it('should have the basic information populated', async () => {
    let port, host, protocol, metadata

    callback = (req, res, next) => {
      metadata = res.metadata
      const parts = req.get('host').split(':')
      port = Number(req.get('port') || parts[1])
      host = parts[0]
      protocol = port === 443 ? 'https' : 'http'

      res.json({
        status: 'ok',
        metadata: metadata.toJSON()
      })
    }

    const response = await request(app).get(testUrl).expect(200)

    expect(getValue(response.body.metadata, 'http.url')).to.eql(testUrl)
    expect(getValue(response.body.metadata, 'http.port')).to.eql(port)
    expect(getValue(response.body.metadata, 'http.host')).to.eql(host)
    expect(getValue(response.body.metadata, 'http.protocol')).to.eql(protocol)
    expect(getValue(response.body.metadata, 'http.siteUrl')).to.eql(`${protocol}://${host}:${port}`)
    expect(getValue(response.body.metadata, 'http.fullUrl')).to.eql(`${protocol}://${host}:${port}${testUrl}`)
  })
})
