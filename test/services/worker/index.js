const path = require('path')
const { expect } = require('chai')
const { InternalServerError } = require('@vapaaradikaali/errors')
const helpers = require('@vapaaradikaali/helpers.js')
const Service = require('../../../services')
const WorkerService = require('../../../services/worker')
const { WorkerError, WorkerUnresolved } = WorkerService.errors
const config = new helpers.Config()

describe('services/worker', () => {
  const app = {
    helpers,
    config
  }

  const worker = new WorkerService(app)

  before(async () => {
    await worker.register()
  })

  it('should register a name', () => {
    expect(WorkerService.SERVICE_NAME).to.equal('worker')
  })

  it('should expose WorkerError', () => {
    const err = new WorkerError('Error')
    expect(err).to.be.an.instanceof(InternalServerError)
  })

  it('should be an instance of service', async () => {
    expect(worker).to.be.an.instanceof(Service)
    expect(worker).to.be.an.instanceof(WorkerService)
  })

  it('should reject an error message', async () => {
    try {
      await worker.do('error')
      throw new Error('Should have thrown a WorkerError')
    } catch (err) {
      expect(err).to.be.an.instanceof(WorkerError)
    }
  })

  it('should receive an echo', async () => {
    const testData = ['foo', 'bar']
    const [response] = await worker.do('echo', testData)

    expect(response).to.eql(testData)
  })

  it('should set log level', async () => {
    const level = await worker.setLogLevel(0)
    expect(level).to.eql(0)
  })

  it('should throw a WorkerError for path that cannot be found', async () => {
    try {
      const testData = { random: Math.random() }
      await worker.do('execute', { path: 'foobar' }, testData)
      throw new Error('Should have thrown a WorkerError')
    } catch (err) {
      expect(err).to.be.an.instanceof(WorkerError)
    }
  })

  it('should execute the given file path', async () => {
    const testData = { random: Math.random() }
    const f = path.join(__dirname, '..', '..', 'resources', 'lib', 'workers', 'test-callback')
    const response = await worker.do('execute', { path: f }, testData)

    expect(response).to.eql(testData)
  })

  it('should execute the given file path and function', async () => {
    const testData = { random: Math.random() }
    const f = path.join(__dirname, '..', '..', 'resources', 'lib', 'workers', 'test-callback')
    const response = await worker.do('execute', { path: f, method: 'testCallback', timeout: 6 }, testData)

    expect(response).to.eql(testData)
  })

  it('should clear unresolved worker if it does not resolve within the given time', (done) => {
    const testData = { random: Math.random() }
    const f = path.join(__dirname, '..', '..', 'resources', 'lib', 'workers', 'test-no-resolve')

    worker.do('execute', { path: f, timeout: 0.010 }, testData)
      .then(() => {
        done(new Error('Should not have resolved'))
      })
      .catch((err) => {
        expect(err).to.be.an.instanceof(WorkerUnresolved)
        done()
      })
  })
})
