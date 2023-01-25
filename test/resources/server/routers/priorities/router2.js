module.exports = {
  priority: 2,
  registerRouter: (app) => {
    const testUrl = '/test/serv../lib/routers/priorities/router'
    app.get(testUrl, (req, res, next) => {
      res.send('router2')
    })
  }
}
