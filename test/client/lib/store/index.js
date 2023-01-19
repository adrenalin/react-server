const { expect } = require('chai')
const MockAdapter = require('axios-mock-adapter')
// const { InvalidArgument } = require('@vapaaradikaali/errors')
// const { castToArray } = require('@vapaaradikaali/helpers.js')
const createStore = require('../../../../client/lib/store')
const request = require('../../../../client/lib/request')

describe('client/lib/store', () => {
  const mock = new MockAdapter(request)
  const testUrl = '/test/client/lib/store'

  const testItem = {
    id: 1,
    value: 'foobar'
  }

  mock.onGet(testUrl, {
    item: testItem,
    items: [testItem]
  })

  after(async () => {
    mock.reset()
  })

  it('should expose actions', () => {
    const actions = require('../../../../client/lib/store/actions')

    expect(createStore.getModelActions).to.be.a('function')
    expect(createStore.getModelActions).to.equal(actions.getModelActions)

    expect(createStore.getListActions).to.be.a('function')
    expect(createStore.getListActions).to.equal(actions.getListActions)
  })

  it('should build actions, source and store', () => {
    const params = {
      getItem: {
        method: 'get',
        uri: testUrl,
        response: {
          key: 'item'
        },
        actions: {
          success: 'loadSuccess'
        }
      }
    }

    const actions = createStore.getActions('TestBuild')
    const source = createStore.buildSource('TestBuild', actions)
    const store = createStore.buildStore(source)

    const TestBuildStore = createStore('TestBuild', params)

    expect(TestBuildStore.actions).to.equal(actions)
    expect(TestBuildStore.source).to.equal(source)
    expect(TestBuildStore.store).to.equal(store)
  })
})
