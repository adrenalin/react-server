/**
 * Test callback that resolves after the given timeout
 *
 * @private
 * @function testCallbackSleep
 * @param { mixed } input             Input argument
 * @return { Promise }                Promise
 */
function testCallbackSleep (input) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), input * 1000)
  })
}

module.exports = testCallbackSleep
