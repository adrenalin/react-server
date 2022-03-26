module.exports = {
  priority: 100,
  registerRouter: (app) => {
    throw new Error('Fails on purpose')
  }
}
