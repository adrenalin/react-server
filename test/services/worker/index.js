const path = require('path')
const { expect } = require('chai')
const { InternalServerError } = require('@vapaaradikaali/errors')
const helpers = require('@vapaaradikaali/helpers.js')
const Service = require('../../../services')
const WorkerService = require('../../../services/worker')
const { WorkerError } = WorkerService.errors
const config = new helpers.Config()

describe('services/worker', () => {
  const app = {
    helpers,
    config
  }

  it('should register a name', () => {
    expect(WorkerService.SERVICE_NAME).to.equal('worker')
  })

  it('should expose WorkerError', () => {
    const err = new WorkerError('Error')
    expect(err).to.be.an.instanceof(InternalServerError)
  })

  it('should be an instance of service', async () => {
    const worker = new WorkerService(app)
    await worker.register()
    expect(worker).to.be.an.instanceof(Service)
    expect(worker).to.be.an.instanceof(WorkerService)
  })

  it('should reject an error message', async () => {
    try {
      const worker = new WorkerService(app)
      await worker.register()
      await worker.do('error')
      throw new Error('Should have thrown a WorkerError')
    } catch (err) {
      expect(err).to.be.an.instanceof(WorkerError)
    }
  })

  it('should receive an echo', async () => {
    const testData = ['foo', 'bar']
    const worker = new WorkerService(app)
    await worker.register()
    const [response] = await worker.do('echo', testData)

    expect(response).to.eql(testData)
  })

  it('should throw a WorkerError for path that cannot be found', async () => {
    try {
      const testData = { random: Math.random() }
      const worker = new WorkerService(app)
      await worker.register()
      await worker.do('execute', { path: 'foobar' }, testData)
      throw new Error('Should have thrown a WorkerError')
    } catch (err) {
      expect(err).to.be.an.instanceof(WorkerError)
    }
  })

  it('should execute the given file path', async () => {
    const testData = { random: Math.random() }
    const worker = new WorkerService(app)
    await worker.register()
    const f = path.join(__dirname, '..', '..', 'resources', 'lib', 'workers', 'test-callback')
    const response = await worker.do('execute', { path: f }, testData)

    expect(response).to.eql(testData)
  })

  it('should execute the given file path and function', async () => {
    const testData = { random: Math.random() }
    const worker = new WorkerService(app)
    await worker.register()
    const f = path.join(__dirname, '..', '..', 'resources', 'lib', 'workers', 'test-callback')
    const response = await worker.do('execute', { path: f, method: 'testCallback' }, testData)

    expect(response).to.eql(testData)
  })
})
