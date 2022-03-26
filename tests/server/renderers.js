const path = require('path')
const expect = require('expect.js')
const server = require('../../server/application')

describe('server/renderers', () => {
  it('should register the configured renderers', async () => {
    const testRendererType = 'html'
    const testRenderer = {
      module: 'express-es6-template-engine',
      path: 'views',
      engine: 'html'
    }

    const app = await server({
      renderers: {
        [testRendererType]: testRenderer
      }
    })

    expect(app.renderers[testRendererType]).to.be.an('object')
    const renderer = app.renderers[testRendererType]

    expect(renderer.engine).to.eql(testRendererType)
    expect(renderer.module).to.eql(testRenderer.module)
    expect(renderer.path).to.eql(path.join(app.APPLICATION_ROOT, testRenderer.path))
    expect(renderer.renderer).to.be.a('function')
  })
})