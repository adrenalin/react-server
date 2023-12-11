module.exports = async (app) => {
  if (!app.config.get('session.enabled')) {
    return app
  }

  const session = require('express-session')
  const RedisStore = require('connect-redis')(session)

  // redis@v4
  const { createClient } = require('redis')
  const redisClient = createClient({ legacyMode: true })
  redisClient.connect(app.config.get('redis', {})).catch(console.error)
  const store = new RedisStore({
    client: redisClient,
    prefix: app.config.get('session.prefix')
  })

  const cookie = {
    path: app.config.get('session.cookie.path', '/'),
    httpOnly: app.config.get('session.cookie.httpOnly', true)
  }

  const cookieParams = ['maxAge', 'sameSite', 'domain', 'secure']

  cookieParams.forEach((p) => {
    const v = app.config.get(`session.cookie.${p}`)

    if (v) {
      cookie[p] = v
    }
  })

  app.sessionStore = store

  app.use(
    session({
      store,
      cookie,
      saveUninitialized: false,
      secret: app.config.get('session.secret'),
      resave: false
    })
  )

  return app
}
