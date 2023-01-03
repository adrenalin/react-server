module.exports = {
  priority: 1,
  registerRouter: (app) => {
    const testUrl = '/test/server/routers/priorities/router'
    app.get(testUrl, (req, res, next) => {
      res.send('router1')
    })
  }
}
