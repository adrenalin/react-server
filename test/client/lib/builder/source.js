const { expect } = require('chai')
const { BadRequest, InvalidArgument, MethodNotAllowed } = require('@vapaaradikaali/errors')
const MockAdapter = require('axios-mock-adapter')
const { getModelActions } = require('../../../../client/lib/builder/actions')
const buildSource = require('../../../../client/lib/builder/source')
const request = require('../../../../client/lib/request')

describe('client/lib/builder/source', () => {
  const testUrl = '/test/client/lib/builder/source'
  const mock = new MockAdapter(request)

  const actions = getModelActions('TestSourceActions')
  const methods = {
    getItem: {
      method: 'get',
      uri: testUrl,
      key: 'item',
      actions: {
        success: actions.getSuccess
      }
    }
  }

  afterEach(async () => {
    mock.reset()
  })

  it('should throw InvalidArgument when name is missing', () => {
    expect(() => buildSource()).to.throw(InvalidArgument)
    expect(() => buildSource({ actions, methods })).to.throw(InvalidArgument)
    expect(() => buildSource(null, actions, methods)).to.throw(InvalidArgument)
  })

  it('should throw InvalidArgument when actions is missing', () => {
    expect(() => buildSource('TestInvalidArgument')).to.throw(InvalidArgument)
    expect(() => buildSource({ name: 'test', methods })).to.throw(InvalidArgument)
    expect(() => buildSource('TestInvalidArgument', null, methods)).to.throw(InvalidArgument)
  })

  it('should build a source from name, actions and methods', () => {
    const source = buildSource('TestBuildSourceFromArguments', actions, methods)

    expect(source.getItem).to.be.a('function')
  })

  it('should build a source from an object', () => {
    const actions = getModelActions('TestModelActions')
    const source = buildSource({ name: 'TestSourceBuildFromObject', actions, methods })
    const singleton = buildSource({ name: 'TestSourceBuildFromObject', actions, methods })

    expect(source.getItem).to.be.a('function')
    expect(source.constructor.name).to.eql('TestSourceBuildFromObjectSource')
    expect(source).to.equal(singleton)

    expect(source.constructor.actions).to.equal(actions)
    expect(Array.from(source.constructor.responseKeys)).to.contain('item')
  })

  it('should throw an InvalidArgument when there is no action for the configured methods', () => {
    const subset = { ...actions }
    delete subset.getItem

    expect(() => buildSource('TestNoActionsFound', subset, methods)).to.throw(InvalidArgument)
    expect(() => buildSource({ name: 'TestNoActionsFound', subset, methods })).to.throw(InvalidArgument)
  })

  it('should throw a MethodNotAllowed for an invalid method type in methods', () => {
    const invalidMethods = JSON.parse(JSON.stringify(methods))
    invalidMethods.getItem.method = 'foobar'
    invalidMethods.getItem.actions.success = actions.getSuccess

    expect(() => buildSource('TestMethodNotAllowed', actions, invalidMethods)).to.throw(MethodNotAllowed)
  })

  it('should use requestFailed', (done) => {
    const testActions = {
      ...getModelActions('TestModelActions'),
      requestFailed: (err) => { // eslint-disable-line handle-callback-err
        done()
      }
    }
    const source = buildSource({ name: 'TestRequestFailedSource', actions: testActions, methods })
    source.getItem().remote()
  })

  it('should return data when uri is defined as a string', async () => {
    const testItem = { id: 1 }
    const testMethods = {
      getItem: {
        method: 'get',
        uri: testUrl,
        actions: {
          success: actions.getSuccess
        }
      }
    }

    mock.onGet(testUrl).reply(200, { status: 'ok', item: testItem })
    const source = buildSource('TestUriAsString', actions, testMethods)

    const response = await source.getItem().remote()
    expect(response).to.eql({ item: testItem })
  })

  it('should return data matching custom key', async () => {
    const testItem = { id: 1 }
    const testKey = 'foobar'

    const testMethods = {
      getItem: {
        method: 'get',
        uri: testUrl,
        key: testKey,
        actions: {
          success: actions.getSuccess
        }
      }
    }

    mock.onGet(testUrl).reply(200, { status: 'ok', [testKey]: testItem })
    const source = buildSource('TestMatchCustomKeys', actions, testMethods)

    const response = await source.getItem().remote()
    expect(response).to.eql({ [testKey]: testItem })
  })

  it('should return data matching multiple custom keys', async () => {
    const testItem = { id: 1 }
    const testKey = 'foobar'

    const testMethods = {
      getItem: {
        method: 'get',
        uri: testUrl,
        keys: [testKey],
        actions: {
          success: actions.getSuccess
        }
      }
    }

    mock.onGet(testUrl).reply(200, { status: 'ok', [testKey]: testItem })
    const source = buildSource('TestMatchCustomKeysAsArray', actions, testMethods)

    const response = await source.getItem().remote()
    expect(response).to.eql({ [testKey]: testItem })
  })

  it('should throw a BadRequest when all custom keys are not found', async () => {
    try {
      const testItem = { id: 1 }
      const testKey = 'item'

      const testMethods = {
        getItem: {
          method: 'get',
          uri: testUrl,
          keys: ['foobar'],
          actions: {
            success: actions.getSuccess
          }
        }
      }

      mock.onGet(testUrl).reply(200, { status: 'ok', [testKey]: testItem })
      const source = buildSource('TestNoMatchingCustomKeysAsArray', actions, testMethods)

      await source.getItem().remote()
      throw new Error('Should have thrown a BadRequest')
    } catch (err) {
      expect(err).to.be.instanceof(BadRequest)
    }
  })

  it('should fail when specified keys were not found', (done) => {
    const testItem = { id: 1 }
    const testActions = {
      ...getModelActions('TestModelActions'),
      requestFailed: (err) => { // eslint-disable-line handle-callback-err
        done()
      }
    }
    mock.onGet(`${testUrl}?foo=bar`).reply(200, { status: 'ok', item: testItem })

    const source = buildSource({ name: 'TestSourceKeysNotFound', actions: testActions, methods })
    source.getItem().remote()
  })

  it('should return data when uri is defined as a function', async () => {
    const testItem = { id: 1 }
    const testState = { foo: 'bar' }
    const testArgs = [1, 2, 3]

    const testMethods = {
      getItem: {
        method: 'get',
        uri: (state, ...args) => {
          expect(state).to.eql(testState)
          expect(args).to.eql(testArgs)
          return `${testUrl}?foo=bar`
        },
        key: 'item',
        actions: {
          success: actions.getSuccess
        }
      }
    }

    mock.onGet(`${testUrl}?foo=bar`).reply(200, { status: 'ok', item: testItem })
    const source = buildSource('TestUriAsFunction', actions, testMethods)

    const response = await source.getItem().remote(testState, ...testArgs)
    expect(response).to.eql({ item: testItem })
  })

  it('should return data from local function', async () => {
    const testItem = { id: 1 }
    const testState = { foo: 'bar' }
    const testArgs = [1, 2, 3]

    const testMethods = {
      getItem: {
        method: 'get',
        uri: testUrl,
        key: 'item',
        local: (state, ...args) => {
          expect(state).to.eql(testState)
          expect(args).to.eql(testArgs)
          return { item: testItem }
        },
        actions: {
          success: actions.getSuccess
        }
      }
    }

    const source = buildSource('TestLocalFunction', actions, testMethods)

    const response = await source.getItem().local(testState, ...testArgs)
    expect(response).to.eql({ item: testItem })
  })

  it('should use function to parse the response', async () => {
    const testItem = { id: 1 }

    const testMethods = {
      getItem: {
        method: 'get',
        uri: testUrl,
        response: () => testItem,
        local: () => {
          return { item: testItem }
        },
        actions: {
          success: actions.getSuccess
        }
      }
    }

    const source = buildSource('TestResponseFunction', actions, testMethods)
    mock.onGet(testUrl).reply(200, { status: 'ok' })

    const response = await source.getItem().remote()
    expect(response).to.eql(testItem)
  })

  it('should send data defined in params as an object', async () => {
    const testItem = { id: 1 }
    const testData = { id: 2 }

    mock.onPost(testUrl, testData).reply(200, { item: testItem })

    const testMethods = {
      getItem: {
        method: 'post',
        uri: testUrl,
        params: testData,
        actions: {
          success: actions.getSuccess
        }
      }
    }

    const source = buildSource('TestParamsAsObject', actions, testMethods)

    const response = await source.getItem(testData).remote()
    expect(response).to.eql({ item: testItem })
  })

  it('should send data defined in params as a function', async () => {
    const testItem = { id: 1 }
    const testData = { id: 2 }
    const testState = { foo: 'bar' }
    const testArgs = [1, 2, 3]

    mock.onPost(testUrl, testData).reply(200, { item: testItem })

    const testMethods = {
      getItem: {
        method: 'post',
        uri: testUrl,
        params: (state, ...args) => {
          expect(state).to.eql(testState)
          expect(args).to.eql(testArgs)
          return testData
        },
        actions: {
          success: actions.getSuccess
        }
      }
    }

    const source = buildSource('TestParamsAsFunction', actions, testMethods)

    const response = await source.getItem(testData).remote(testState, ...testArgs)
    expect(response).to.eql({ item: testItem })
  })

  it('should resolve action from a string', async () => {
    const testItem = { id: 1 }
    const testKey = 'foobar'

    const testMethods = {
      getItem: {
        method: 'get',
        uri: testUrl,
        keys: [testKey],
        actions: {
          success: 'getSuccess'
        }
      }
    }

    mock.onGet(testUrl).reply(200, { status: 'ok', [testKey]: testItem })
    const source = buildSource('TestActionAsString', actions, testMethods)

    const response = await source.getItem().remote()
    expect(response).to.eql({ [testKey]: testItem })
  })

  it('should throw an InvalidArgument when action as a string is not found', async () => {
    const testItem = { id: 1 }
    const testKey = 'foobar'

    const testMethods = {
      getItem: {
        method: 'get',
        uri: testUrl,
        keys: [testKey],
        actions: {
          success: 'foobar'
        }
      }
    }

    mock.onGet(testUrl).reply(200, { status: 'ok', [testKey]: testItem })
    expect(() => buildSource('TestActionAsStringFailure', actions, testMethods)).to.throw(InvalidArgument)
  })
})
