const path = require('path')
const { expect } = require('chai')
const server = require('../../../server/application')

describe('server/middleware/renderers', () => {
  it('should register the configured renderers', async () => {
    const testRendererType = 'html'
    const testRenderer = {
      enabled: true,
      module: 'express-es6-template-engine',
      path: 'views',
      engine: 'html'
    }

    const app = await server({
      middleware: {
        renderers: {
          [testRendererType]: testRenderer
        }
      }
    })

    expect(app.renderers[testRendererType]).to.be.a('object')
    const renderer = app.renderers[testRendererType]

    expect(renderer.engine).to.eql(testRendererType)
    expect(renderer.module).to.eql(testRenderer.module)
    expect(renderer.path).to.eql(path.join(app.APPLICATION_ROOT, testRenderer.path))
    expect(renderer.renderer).to.be.a('function')
  })
})
