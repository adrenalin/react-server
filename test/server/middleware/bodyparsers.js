const axios = require('axios')
const supertest = require('supertest')
const { expect } = require('chai')
const { buildUrl } = require('@vapaaradikaali/helpers.js')
const initServer = require('../../../server')
console.log(initServer.toString())

describe('server/middleware/bodyparsers', () => {
  let app, callback, errCallback
  const testUrl = '/test/server/middleware/bodyparsers'

  before(async () => {
    app = await initServer({
      server: {
        port: null
      },
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

    console.log('register POST', testUrl)
    app.post(testUrl, (req, res, next) => {
      console.log('got post 1', req.originalUrl)
      res.json(req.body)
      next()
    })

    console.log('register POST', testUrl)
    app.post(testUrl, (req, res, next) => {
      console.log('got post 2', req.originalUrl)
      callback(req, res, next)
    })

    console.log('register ALL error', testUrl)
    app.all(testUrl, (err, req, res, next) => {
      errCallback(err, req, res, next)
    })
  })

  beforeEach(async () => {
    callback = (req) => {}
    errCallback = (err, req, res, next) => {
      console.log(err)
    }
  })

  it.skip('should apply body parsers for URL enconded strings', (done) => {
    const contentType = 'application/x-www-form-urlencoded'
    const testKey = 'test-key'
    const testValue = 'test-value'
    const payload = `${encodeURIComponent(testKey)}=${encodeURIComponent(testValue)}`

    callback = (req, res, next) => {
      expect(req.body[testKey]).to.eql(testValue)
      expect(req.rawBody).to.eql(payload)
      done()
    }

    errCallback = (err) => {
      done(err)
    }

    const url = buildUrl({
      protocol: 'http',
      host: 'localhost',
      port: app.config.get('server.port'),
      location: testUrl
    })

    console.log('url', url)

    axios.request({
      url,
      method: 'POST',
      data: payload,
      headers: {
        'content-type': contentType
      }
    })
  })

  it.skip('should apply body parsers for JSON', (done) => {
    const contentType = 'application/json'
    const payload = {
      test: 'payload'
    }

    callback = (req, res, next) => {
      expect(req.body).to.eql(payload)
      expect(req.rawBody).to.eql(JSON.stringify(payload))
      done()
    }

    errCallback = (err) => {
      done(err)
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

    errCallback = (err) => {
      done(err)
    }

    supertest(app)
      .post(testUrl)
      .set('content-type', contentType)
      .send(JSON.stringify(payload))
      .expect(200)
    //
    // const url = buildUrl({
    //   protocol: 'http',
    //   host: 'localhost',
    //   port: app.config.get('server.port'),
    //   location: testUrl
    // })
    //
    // axios.request({
    //   url,
    //   method: 'POST',
    //   data: JSON.stringify(payload),
    //   headers: {
    //     'content-type': contentType
    //   }
    // })
  })
})
