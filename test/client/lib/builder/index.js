const { expect } = require('chai')
const MockAdapter = require('axios-mock-adapter')
// const { InvalidArgument } = require('@vapaaradikaali/errors')
// const { castToArray } = require('@vapaaradikaali/helpers.js')
const Builder = require('../../../../client/lib/builder')
const request = require('../../../../client/lib/request')

describe('client/lib/builder', () => {
  const mock = new MockAdapter(request)
  const testUrl = '/test/client/lib/builder'

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
    const actions = require('../../../../client/lib/builder/actions')

    expect(Builder.getModelActions).to.be.a('function')
    expect(Builder.getModelActions).to.equal(actions.getModelActions)

    expect(Builder.getListActions).to.be.a('function')
    expect(Builder.getListActions).to.equal(actions.getListActions)
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

    const actions = Builder.getActions('TestBuild')
    const source = Builder.buildSource('TestBuild', actions)
    const store = Builder.buildStore(source)

    const { TestBuildStore, TestBuildSource, TestBuildActions } = Builder('TestBuild', params)

    expect(TestBuildActions).to.equal(actions)
    expect(TestBuildSource).to.equal(source)
    expect(TestBuildStore).to.equal(store)
  })
})
