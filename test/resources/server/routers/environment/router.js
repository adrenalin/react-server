module.exports = {
  priority: 100,
  registerRouter: (app) => {
    const testUrl = '/test/server/routers/environment/router'
    app.get(testUrl, (req, res, next) => {
      res.send(testUrl)
    })
  }
}
