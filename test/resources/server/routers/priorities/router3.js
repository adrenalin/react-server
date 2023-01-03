module.exports = {
  priority: 0,
  registerRouter: (app) => {
    const testUrl = '/test/server/routers/priorities/router'
    app.get(testUrl, (req, res, next) => {
      res.send('router3')
    })
  }
}
