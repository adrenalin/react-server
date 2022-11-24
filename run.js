try {
  require('@babel/register')
  const initServer = require('./server')
  initServer({
    applicationRoot: __dirname
  })
} catch (err) {
  console.log(err)
}
