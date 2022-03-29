module.exports = async (app) => {
  const middleware = app.config.get('middleware')

  for (const type in middleware) {
    if (app.config.get(`middleware.${type}.enabled`) === false) {
      continue
    }

    const loader = require(`./${type}`)
    await loader(app)
  }

  return app
}
