/**
 * Test callback that never resolves
 *
 * @private
 * @function testCallbackNoResolve
 * @param { mixed } input             Input argument
 * @return { Promise }                Promise
 */
function testCallbackNoResolve (input) {
  return new Promise((resolve, reject) => {})
}

module.exports = testCallbackNoResolve
