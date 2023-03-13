/**
 * Test callback that returns its input
 *
 * @private
 * @function testCallback
 * @param { mixed } input             Input argument
 * @return { mixed }                  Input argument
 */
function testCallback (input) {
  return input
}

// Reference to self
testCallback.testCallback = testCallback

module.exports = testCallback
