import DefaultError from './defaulterror'

export default class InvalidRequest extends DefaultError {
  static STATUS_CODE = 400
}
