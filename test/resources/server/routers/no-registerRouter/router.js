module.exports = (app) => {
  const testUrl = '/tests/server/routers/no-registerRouter/router'
  app.get(testUrl, (req, res, next) => {
    res.send(testUrl)
  })
}
