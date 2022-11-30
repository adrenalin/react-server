import Test from './test'
import TestUndefined from './test/undefined'
import TestFormValidation from './test/formvalidation'
import NotFound from '../shared/response/notfound'

module.exports = {
  '/:lang': {
    component: Test,
    exact: true
  },
  '/:lang/undefined': {
    component: TestUndefined,
    exact: true
  },
  '/:lang/formvalidation': {
    component: TestFormValidation,
    exact: true
  },
  '*': {
    component: NotFound
  }
}
