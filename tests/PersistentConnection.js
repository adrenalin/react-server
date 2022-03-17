/**
 * Persistent connection is a class written on top of the supertest-session
 * to persist the headers within a test run
 *
 * @author Arttu Manninen <arttu@kaktus.cc>
 */
const request = require('supertest-session')

module.exports = class PersistentConnection {
  constructor (app) {
    this.app = app
    this.headers = {}
    this.session = null
  }

  /**
   * Set an existing session
   *
   * @param { object } session        Session data
   * @return { PersistentConnection } This instance
   */
  setSession (session) {
    this.session = session
    return this
  }

  /**
   * Do a GET request
   *
   * @param { string } url            Session data
   * @return { Test }                 Supertest session Test
   */
  get (url) {
    const request = this.request('get', url)
    return request
  }

  /**
   * Do a POST request
   *
   * @param { string } url            Session data
   * @param { mixed } data            Request data
   * @return { Test }                 Supertest session Test
   */
  post (url, data) {
    return this.request('post', url)
      .send(data)
  }

  /**
   * Do a PUT request
   *
   * @param { string } url            Session data
   * @param { mixed } data            Request data
   * @return { Test }                 Supertest session Test
   */
  put (url, data) {
    return this.request('put', url)
      .send(data)
  }

  /**
   * Do a PATCH request
   *
   * @param { string } url            Session data
   * @param { mixed } data            Request data
   * @return { Test }                 Supertest session Test
   */
  patch (url, data) {
    return this.request('patch', url)
      .send(data)
  }

  /**
   * Do a DELETE request
   *
   * @param { string } url            Session data
   * @return { Test }                 Supertest session Test
   */
  delete (url) {
    return this.request('delete', url)
  }

  /**
   * Do an OPTIONS request
   *
   * @param { string } url            Session data
   * @return { Test }                 Supertest session Test
   */
  options (url) {
    return this.request('options', url)
  }

  /**
   * Do login
   *
   * @param { string } username       Username
   * @param { string } password       Password
   * @return { Test }                 Supertest session Test
   */
  async login (username, password, url) {
    if (this.headers.cookie) {
      return this
    }

    const response = await this
      .request('post', url || '/login')
      .send({ username, password })

    response.headers['set-cookie'].forEach((cookie) => {
      this.setHeader('cookie', cookie.match(/^(.+?);/)[1])
    })

    return this
  }

  /**
   * Do a request
   *
   * @param { string } method         Request method
   * @param { string } url            Request URL
   * @return { Test }                 Supertest session Test
   */
  request (method, url) {
    if (typeof request(this.app)[method] !== 'function') {
      throw new Error(`Invalid method "${method}"`)
    }

    const r = request(this.app)[method](url)

    Object.keys(this.headers).forEach((k) => {
      r.set(k.toLowerCase(), this.headers[k])
    })

    return r
  }

  /**
   * Set header for the request. Convenience method to call setHeaders
   *
   * @param { mixed } headers         Headers to set
   * @param { string } value          Header value
   * @return { Test }                 Supertest session Test
   */
  setHeader (k, v) {
    return this.setHeaders(k, v)
  }

  /**
   * Set headers for the request
   *
   * @param { mixed } headers         Headers to set
   * @param { string } value          Header value
   * @return { Test }                 Supertest session Test
   */
  setHeaders (headers, value) {
    if (value) {
      this.headers[headers.toLowerCase()] = value
      return this
    }

    Object.keys(headers).forEach((header) => {
      this.setHeaders(header, headers[header])
    })

    return this
  }
}
