const path = require('path')
const { expect } = require('chai')
const { Config } = require('@vapaaradikaali/helpers.js')
const EventsService = require('../../../services/events')

describe('services/events', () => {
  const createApp = () => {
    const app = require('express')()
    app.APPLICATION_ROOT = path.join(__dirname, '..', '..', '..')
    app.config = new Config()
    return app
  }

  it('should define the service name as a static property', (done) => {
    expect(EventsService.SERVICE_NAME).to.eql('events')
    done()
  })

  it('should handle on event cycle', (done) => {
    let counter = 0
    const app = createApp()
    const service = new EventsService(app)
    service.register()

    const eventArgs = ['foo', 'bar']
    const eventName = 'onEventCycle'

    service.on(eventName, (...args) => {
      expect(args).to.eql(eventArgs)
      counter++
    })

    service.emit(eventName, ...eventArgs)
    service.emit(eventName, ...eventArgs)
    service.emit(eventName, ...eventArgs)

    setTimeout(() => {
      expect(counter).to.eql(3)
      done()
    }, 20)
  })

  it('should handle once event cycle', (done) => {
    let counter = 0
    const app = createApp()
    const service = new EventsService(app)
    service.register()

    const eventArgs = ['foo', 'bar']
    const eventName = 'onceEventCycle'

    service.once(eventName, (...args) => {
      expect(args).to.eql(eventArgs)
      counter++
    })

    service.emit(eventName, ...eventArgs)
    service.emit(eventName, ...eventArgs)
    service.emit(eventName, ...eventArgs)

    setTimeout(() => {
      expect(counter).to.eql(1)
      done()
    }, 20)
  })

  it('should handle off event cycle', (done) => {
    let counter = 0
    const app = createApp()
    const service = new EventsService(app)
    service.register()

    const eventArgs = ['foo', 'bar']
    const eventName = 'onEventCycle'
    const callback = (...args) => {
      expect(args).to.eql(eventArgs)
      counter++
    }

    service.on(eventName, callback)
    service.emit(eventName, ...eventArgs)

    service.off(eventName, callback)

    service.emit(eventName, ...eventArgs)
    service.emit(eventName, ...eventArgs)

    setTimeout(() => {
      expect(counter).to.eql(1)
      done()
    }, 20)
  })

  it('should have trigger as an alias of emit', () => {
    const app = createApp()
    const service = new EventsService(app)
    expect(service.trigger).to.equal(service.emit)
  })

  it('should have listen as an alias of on', () => {
    const app = createApp()
    const service = new EventsService(app)
    expect(service.listen).to.equal(service.on)
  })

  it('should have unlisten as an alias of off', () => {
    const app = createApp()
    const service = new EventsService(app)
    expect(service.unlisten).to.equal(service.off)
  })
})
