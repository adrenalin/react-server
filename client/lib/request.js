const request = require('axios')
const { getValue } = require('@vapaaradikaali/helpers.js')
const EventHandler = require('./events')

const events = new EventHandler()

request.interceptors.response.use((response) => {
  return response
}, (err) => {
  const statusCode = getValue(err, 'response.status', 500)

  events.emit('notifications.add', {
    color: 'danger',
    title: `errorMessage${statusCode}`,
    request: err.request,
    response: err.response,
    statusCode,
    id: `statusCode${statusCode}`,
    message: [
      getValue(err, 'response.data.message', `errorMessage${statusCode}`),
      getValue(err, 'request.responseURL')
    ]
  })

  return Promise.reject(err)
})
module.exports = request
