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

  beforeEach(async () => {
    app.config.set('services.worker.maxThreadSize', null)
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

  it('should get worker pid', async () => {
    const pid = await worker.getPid()
    expect(pid).to.be.a('number')
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
    const testData = 60
    const f = path.join(__dirname, '..', '..', 'resources', 'lib', 'workers', 'test-sleep')

    worker.do('execute', { path: f, timeout: 0.010 }, testData)
      .then(() => {
        done(new Error('Should not have resolved'))
      })
      .catch((err) => {
        expect(err).to.be.an.instanceof(WorkerUnresolved)
        done()
      })
  })

  it('should not crash when a worker resolves after the given timeout', async () => {
    const testData = 60
    const f = path.join(__dirname, '..', '..', 'resources', 'lib', 'workers', 'test-sleep')

    worker.do('execute', { path: f, timeout: 0.05 }, testData)
    for (const key in worker.actions) {
      delete worker.actions[key]
    }
    await helpers.sleep(100)
  })

  it('should kill a worker', async () => {
    const w = new WorkerService(app)
    await w.register()
    await w.kill()
    expect(w.worker).to.eql(undefined)
  })

  it('should not fail to kill an uninitialized worker', async () => {
    const w = new WorkerService(app)
    await w.kill()
  })

  it.only('should kill the worker after it is ready when terminate option is given', async () => {
    const w = new WorkerService(app)
    const testData = ['foo', 'bar']
    const workers = WorkerService.WORKERS.length
    await w.do('echo', { terminate: true }, testData)
    expect(WorkerService.WORKERS.length).to.eql(workers)
  })

  it('should register worker service in do', async () => {
    const w = new WorkerService(app)
    const testData = ['foo', 'bar']
    const [response] = await w.do('echo', testData)

    expect(response).to.eql(testData)
    await w.kill()
  })

  it('should register only one worker per service', async () => {
    const w = new WorkerService(app)
    await w.register()
    const thread = w.worker

    await w.register()
    expect(thread).to.equal(w.worker)
  })

  it('should respect the maxThreads and do round robin after that', async () => {
    WorkerService.WORKERS.splice(0, WorkerService.WORKERS.length)
    app.config.set('services.worker.maxThreadSize', 2)
    const w1 = new WorkerService(app)
    await w1.register()
    expect(WorkerService.WORKERS.length).to.eql(1)

    const w2 = new WorkerService(app)
    await w2.register()
    expect(WorkerService.WORKERS.length).to.eql(2)

    const w3 = new WorkerService(app)
    await w3.register()
    expect(WorkerService.WORKERS.length).to.eql(2)

    expect(w1.worker).not.to.equal(w2.worker)
    expect(w1.worker).to.equal(w3.worker)
  })
})
