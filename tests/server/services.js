const expect = require('expect.js')
const server = require('../../server')

const L10nService = require('../../services/l10n')

describe('services/l10n', () => {
  const closeServers = (app) => {
    const tasks = app.servers.map((server) => {
      return new Promise((resolve, reject) => {
        server.close(() => {
          resolve()
        })
      })
    })

    return Promise.all(tasks)
  }

  it('should not load l10n service when enabled flag is off', async () => {
    const app = await server({
      server: {
        port: 3333
      },
      services: {
        l10n: {
          enabled: false
        }
      }
    })

    await closeServers(app)
    expect(app.services).not.to.have.property('l10n')
  })

  it('should load l10n service when enabled flag is on', async () => {
    const app = await server({
      server: {
        port: 3333
      },
      services: {
        l10n: {
          enabled: true
        }
      }
    })

    await closeServers(app)
    expect(app.services).to.have.property('l10n')
    expect(app.services.l10n).to.be.a(L10nService)
  })
})
