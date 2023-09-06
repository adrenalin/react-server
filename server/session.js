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

  app.sessionStore = store

  app.use(
    session({
      store,
      saveUninitialized: false,
      secret: app.config.get('session.secret'),
      resave: false
    })
  )

  return app
}
