const path = require('path')
const expect = require('expect.js')
const request = require('supertest')
const { Config } = require('@adrenalin/helpers.js')
const middlewareLoader = require('../../../server/middleware')

describe('server/middleware/cookieparser', () => {
  const createApp = () => {
    const app = require('express')()
    app.APPLICATION_ROOT = path.join(__dirname, '..', '..', '..')
    app.config = new Config()

    return app
  }

  it('should not load the cookieparser when enabled flag is off', async () => {
    const testUrl = '/tests/server/middleware/cookieparser'
    const cookieName = 'testCookie'
    const cookieValue = 'test-cookie'

    const app = createApp()
    app.config.set('middleware.cookieparser.enabled', false)
    await middlewareLoader(app)

    app.get(testUrl, (req, res, next) => {
      res
        .status(req.cookies == null ? 200 : 400)
        .send('ok')
    })

    await request(app).get(testUrl)
      .set('cookie', `${encodeURIComponent(cookieName)}=${encodeURIComponent(cookieValue)}`)
      .expect(200)
  })

  it('should load the cookieparser when enabled flag is on', async () => {
    const testUrl = '/tests/server/middleware/cookieparser'
    const cookieName = 'testCookie'
    const cookieValue = 'test-cookie'

    const app = createApp()
    app.config.set('middleware.cookieparser.enabled', true)
    await middlewareLoader(app)

    app.get(testUrl, (req, res, next) => {
      expect(req.cookies).to.have.property(cookieName)
      expect(req.cookies[cookieName]).to.eql(cookieValue)

      res.send('ok')
    })

    await request(app).get(testUrl)
      .set('cookie', `${encodeURIComponent(cookieName)}=${encodeURIComponent(cookieValue)}`)
      .expect(200)
  })
})
