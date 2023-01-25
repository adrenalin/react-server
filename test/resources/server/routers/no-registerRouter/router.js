module.exports = (app) => {
  const testUrl = '/test/serv../lib/routers/no-registerRouter/router'
  app.get(testUrl, (req, res, next) => {
    res.send(testUrl)
  })
}
