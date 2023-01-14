const { expect } = require('chai')
const { InvalidArgument } = require('@vapaaradikaali/errors')
const MockAdapter = require('axios-mock-adapter')
const { getActions } = require('../../../../client/lib/builder/actions')
const buildSource = require('../../../../client/lib/builder/source')
const buildStore = require('../../../../client/lib/builder/store')
const request = require('../../../../client/lib/request')

describe('client/lib/builder/store', () => {
  const mock = new MockAdapter(request)
  const testUrl = '/test/client/lib/builder/store'
  const actions = getActions('TestStoreActions')
  const testItem = {
    id: 1
  }

  const methods = {
    getItem: {
      method: 'get',
      uri: (state, id) => {
        return `${testUrl}/${id}`
      },
      keys: ['item', 'value'],
      success: actions.getSuccess
    },
    createItem: {
      method: 'post',
      uri: testUrl,
      keys: ['item'],
      success: 'createSuccess'
    },
    updateItem: {
      method: 'patch',
      uri: (state, id) => {
        return `${testUrl}/${id}`
      },
      params: (state, id, data) => {
        return data
      },
      keys: ['item'],
      success: 'updateSuccess'
    },
    listItems: {
      method: 'get',
      uri: testUrl,
      keys: ['items'],
      success: 'listSuccess'
    },
    updateItems: {
      method: 'patch',
      uri: testUrl,
      params: (state, data) => {
        return data
      },
      keys: ['items'],
      success: 'listSuccess'
    }
  }

  const source = buildSource('TestStoreSource', actions, methods)
  const store = buildStore(source)
  let cb = () => {}

  const listener = (...args) => {
    cb(...args) // eslint-disable-line standard/no-callback-literal
  }

  beforeEach(() => {
    store.state.resetModel()
  })

  afterEach(async () => {
    cb = () => {}
    mock.reset()
    store.unlisten(listener)
  })

  it('should build singleton stores', () => {
    const s2 = buildStore(source)
    expect(s2).to.equal(store)
  })

  it('should require source as the argument', () => {
    expect(() => buildStore('foobar')).to.throw(InvalidArgument)
  })

  it('should build an Alt store', () => {
    expect(store.constructor.name).to.eql('AltStore')

    const state = store.getState()
    expect(state.item).to.eql(null, 'state.item should be null')
    expect(state.value).to.eql(null, 'state.value should be null')
  })

  it('should create an item and dispatch it', (done) => {
    mock.onPost(testUrl).reply(200, { status: 'ok', item: testItem, value: true })
    cb = (state) => {
      if (state.error) {
        done(state.error)
        done = () => {}
      }

      if (state.item) {
        expect(state.item).to.eql(testItem)
        done()
        done = () => {}
      }
    }
    store.listen(listener)
    store.createItem()
  })

  it('should get an item and dispatch it', (done) => {
    const id = 1
    const url = `${testUrl}/${id}`
    mock.onGet(url).reply(200, { status: 'ok', item: testItem, value: true })
    cb = (state) => {
      if (state.error) {
        done(state.error)
        done = () => {}
      }

      if (state.item) {
        expect(state.item).to.eql(testItem)
        expect(state.value).to.eql(true)
        done()
        done = () => {}
      }
    }
    store.listen(listener)
    store.getItem(id)
  })

  it('should update an item and dispatch it', (done) => {
    const id = 1
    const url = `${testUrl}/${id}`
    mock.onPatch(url, testItem).reply(200, { status: 'ok', item: testItem })
    cb = (state) => {
      if (state.error) {
        done(state.error)
        done = () => {}
      }

      if (state.item) {
        expect(state.item).to.eql(testItem)
        done()
        done = () => {}
      }
    }
    store.listen(listener)
    store.updateItem(id, testItem)
  })

  it('should list items and dispatch them', (done) => {
    mock.onGet(testUrl).reply(200, { status: 'ok', items: [testItem] })
    cb = (state) => {
      if (state.error) {
        done(state.error)
        done = () => {}
      }

      if (state.items) {
        expect(state.items).to.eql([testItem])
        done()
        done = () => {}
      }
    }
    store.listen(listener)
    store.listItems()
  })

  it('should update items and dispatch them', (done) => {
    mock.onPatch(testUrl, [testItem]).reply(200, { status: 'ok', items: [testItem] })
    cb = (state) => {
      if (state.error) {
        done(state.error)
        done = () => {}
      }

      if (state.items) {
        expect(state.items).to.eql([testItem])
        done()
        done = () => {}
      }
    }
    store.listen(listener)
    store.updateItems([testItem])
  })
})
