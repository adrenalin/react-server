const { expect } = require('chai')
const server = require('../../server')

describe('server/application', () => {
  it('should close all the servers on app.close', async () => {
    const app = await server({
      server: {
        port: 3122
      }
    })
    await app.close()
    expect(app.servers.length).to.equal(0)
  })
})
