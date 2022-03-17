import DefaultError from './defaulterror'

export default class NotFound extends DefaultError {
  static STATUS_CODE = 404
}
