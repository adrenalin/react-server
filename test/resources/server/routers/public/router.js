module.exports = {
  priority: 100,
  registerRouter: (app) => {
    const testUrl = '/test/serv../lib/routers/public/router'
    app.get(testUrl, (req, res, next) => {
      res.send(testUrl)
    })
  }
}
