const axios = require('axios')
const { expect } = require('chai')
const { buildUrl } = require('@vapaaradikaali/helpers.js')
const init = require('../../init')

describe('server/middleware/bodyparsers', () => {
  let app, callback
  const testUrl = '/test/server/middleware/bodyparsers'

  before(async () => {
    app = await init({
      middleware: {
        bodyparsers: {
          enabled: true,
          urlencoded: {
            rawBody: true
          },
          json: {
            enabled: true,
            rawBody: true
          }
        }
      }
    })

    app.post(testUrl, (req, res, next) => {
      res.json(req.body)
      next()
    })

    app.post(testUrl, (req, res, next) => {
      callback(req, res, next)
    })
  })

  beforeEach(async () => {
    callback = (req) => {}
  })

  it('should apply body parsers for URL enconded strings', (done) => {
    const contentType = 'application/x-www-form-urlencoded'
    const testKey = 'test-key'
    const testValue = 'test-value'
    const payload = `${encodeURIComponent(testKey)}=${encodeURIComponent(testValue)}`

    callback = (req, res, next) => {
      expect(req.body[testKey]).to.eql(testValue)
      expect(req.rawBody).to.eql(payload)
      done()
    }

    const url = buildUrl({
      protocol: 'http',
      host: 'localhost',
      port: app.config.get('server.port'),
      location: testUrl
    })

    axios.request({
      url,
      method: 'POST',
      data: payload,
      headers: {
        'content-type': contentType
      }
    })
  })

  it('should apply body parsers for JSON', (done) => {
    const contentType = 'application/json'
    const payload = {
      test: 'payload'
    }

    callback = (req, res, next) => {
      expect(req.body).to.eql(payload)
      expect(req.rawBody).to.eql(JSON.stringify(payload))
      done()
    }

    const url = buildUrl({
      protocol: 'http',
      host: 'localhost',
      port: app.config.get('server.port'),
      location: testUrl
    })

    axios.request({
      url,
      method: 'POST',
      data: JSON.stringify(payload),
      headers: {
        'content-type': contentType
      }
    })
  })
})
