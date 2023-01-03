module.exports = {
  priority: 100,
  registerRouter: (app) => {
    const testUrl = '/tests/server/routers/public/router'
    app.get(testUrl, (req, res, next) => {
      res.send(testUrl)
    })
  }
}
