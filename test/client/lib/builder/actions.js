const { expect } = require('chai')
const { getActions, getModelActions, getListActions } = require('../../../../client/lib/builder/actions')

describe('client/lib/builder/actions', () => {
  it('should build model actions', () => {
    const modelName = 'TestActionsModel'

    const actions = getModelActions(modelName, {
      testMethod: (data) => {}
    })

    const singleton = getModelActions(modelName, {
      testMethod: (data) => {}
    })

    expect(actions).to.equal(singleton)

    // Default model actions
    expect(actions.createItem).to.be.a('function')
    expect(actions.createItem.id).to.eql(`${modelName}.createItem`)
    expect(actions.createItem.data.id).to.eql(`${modelName}.createItem`)
    expect(actions.createItem.data.namespace).to.eql(modelName)
    expect(actions.createItem.data.name).to.eql('createItem')
    expect(actions.CREATE_ITEM).to.eql(`${modelName}.createItem`)

    expect(actions.createSuccess).to.be.a('function')
    expect(actions.createSuccess.id).to.eql(`${modelName}.createSuccess`)
    expect(actions.createSuccess.data.id).to.eql(`${modelName}.createSuccess`)
    expect(actions.createSuccess.data.namespace).to.eql(modelName)
    expect(actions.createSuccess.data.name).to.eql('createSuccess')
    expect(actions.CREATE_SUCCESS).to.eql(`${modelName}.createSuccess`)

    expect(actions.getItem).to.be.a('function')
    expect(actions.getItem.id).to.eql(`${modelName}.getItem`)
    expect(actions.getItem.data.id).to.eql(`${modelName}.getItem`)
    expect(actions.getItem.data.namespace).to.eql(modelName)
    expect(actions.getItem.data.name).to.eql('getItem')
    expect(actions.GET_ITEM).to.eql(`${modelName}.getItem`)

    expect(actions.updateItem).to.be.a('function')
    expect(actions.updateItem.id).to.eql(`${modelName}.updateItem`)
    expect(actions.updateItem.data.id).to.eql(`${modelName}.updateItem`)
    expect(actions.updateItem.data.namespace).to.eql(modelName)
    expect(actions.updateItem.data.name).to.eql('updateItem')
    expect(actions.UPDATE_ITEM).to.eql(`${modelName}.updateItem`)

    expect(actions.updateSuccess).to.be.a('function')
    expect(actions.updateSuccess.id).to.eql(`${modelName}.updateSuccess`)
    expect(actions.updateSuccess.data.id).to.eql(`${modelName}.updateSuccess`)
    expect(actions.updateSuccess.data.namespace).to.eql(modelName)
    expect(actions.updateSuccess.data.name).to.eql('updateSuccess')
    expect(actions.UPDATE_SUCCESS).to.eql(`${modelName}.updateSuccess`)

    expect(actions.getSuccess).to.be.a('function')
    expect(actions.getSuccess.id).to.eql(`${modelName}.getSuccess`)
    expect(actions.getSuccess.data.id).to.eql(`${modelName}.getSuccess`)
    expect(actions.getSuccess.data.namespace).to.eql(modelName)
    expect(actions.getSuccess.data.name).to.eql('getSuccess')
    expect(actions.GET_SUCCESS).to.eql(`${modelName}.getSuccess`)

    expect(actions.requestFailed).to.be.a('function')
    expect(actions.requestFailed.id).to.eql(`${modelName}.requestFailed`)
    expect(actions.requestFailed.data.id).to.eql(`${modelName}.requestFailed`)
    expect(actions.requestFailed.data.namespace).to.eql(modelName)
    expect(actions.requestFailed.data.name).to.eql('requestFailed')
    expect(actions.REQUEST_FAILED).to.eql(`${modelName}.requestFailed`)

    expect(actions.testMethod).to.be.a('function')
    expect(actions.testMethod.id).to.eql(`${modelName}.testMethod`)
    expect(actions.testMethod.data.id).to.eql(`${modelName}.testMethod`)
    expect(actions.testMethod.data.namespace).to.eql(modelName)
    expect(actions.testMethod.data.name).to.eql('testMethod')
    expect(actions.TEST_METHOD).to.eql(`${modelName}.testMethod`)
  })

  it('should build list actions', () => {
    const modelName = 'TestListActions'

    const actions = getListActions(modelName, {
      testMethod: (data) => {}
    })

    const singleton = getListActions(modelName, {
      testMethod: (data) => {}
    })

    expect(actions).to.equal(singleton)

    expect(actions.listItems).to.be.a('function')
    expect(actions.listItems.id).to.eql(`${modelName}.listItems`)
    expect(actions.listItems.data.id).to.eql(`${modelName}.listItems`)
    expect(actions.listItems.data.namespace).to.eql(modelName)
    expect(actions.listItems.data.name).to.eql('listItems')
    expect(actions.LIST_ITEMS).to.eql(`${modelName}.listItems`)

    expect(actions.updateItems).to.be.a('function')
    expect(actions.updateItems.id).to.eql(`${modelName}.updateItems`)
    expect(actions.updateItems.data.id).to.eql(`${modelName}.updateItems`)
    expect(actions.updateItems.data.namespace).to.eql(modelName)
    expect(actions.updateItems.data.name).to.eql('updateItems')
    expect(actions.UPDATE_ITEMS).to.eql(`${modelName}.updateItems`)

    expect(actions.removeItem).to.be.a('function')
    expect(actions.removeItem.id).to.eql(`${modelName}.removeItem`)
    expect(actions.removeItem.data.id).to.eql(`${modelName}.removeItem`)
    expect(actions.removeItem.data.namespace).to.eql(modelName)
    expect(actions.removeItem.data.name).to.eql('removeItem')
    expect(actions.REMOVE_ITEM).to.eql(`${modelName}.removeItem`)

    expect(actions.removeSuccess).to.be.a('function')
    expect(actions.removeSuccess.id).to.eql(`${modelName}.removeSuccess`)
    expect(actions.removeSuccess.data.id).to.eql(`${modelName}.removeSuccess`)
    expect(actions.removeSuccess.data.namespace).to.eql(modelName)
    expect(actions.removeSuccess.data.name).to.eql('removeSuccess')
    expect(actions.REMOVE_SUCCESS).to.eql(`${modelName}.removeSuccess`)

    expect(actions.requestFailed).to.be.a('function')
    expect(actions.requestFailed.id).to.eql(`${modelName}.requestFailed`)
    expect(actions.requestFailed.data.id).to.eql(`${modelName}.requestFailed`)
    expect(actions.requestFailed.data.namespace).to.eql(modelName)
    expect(actions.requestFailed.data.name).to.eql('requestFailed')
    expect(actions.REQUEST_FAILED).to.eql(`${modelName}.requestFailed`)

    expect(actions.testMethod).to.be.a('function')
    expect(actions.testMethod.id).to.eql(`${modelName}.testMethod`)
    expect(actions.testMethod.data.id).to.eql(`${modelName}.testMethod`)
    expect(actions.testMethod.data.namespace).to.eql(modelName)
    expect(actions.testMethod.data.name).to.eql('testMethod')
    expect(actions.TEST_METHOD).to.eql(`${modelName}.testMethod`)
  })

  it('should build combined actions', () => {
    const modelName = 'TestActionsCombined'

    const actions = getActions(modelName, {
      testMethod: (data) => {}
    })

    const singleton = getActions(modelName, {
      testMethod: (data) => {}
    })

    expect(actions).to.equal(singleton)
  })
})
