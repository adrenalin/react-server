module.exports = {
  priority: 100,
  registerRouter: (app) => {
    const testUrl = '/tests/server/routers/environment/router'
    app.get(testUrl, (req, res, next) => {
      res.send(testUrl)
    })
  }
}
