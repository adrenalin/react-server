const path = require('path')
const config = require('../config')

// Build client that uses ES6 + JSX
module.exports = function buildApiDoc (done) {
  const apidoc = require('gulp-apidoc')

  apidoc({
    // debug: true,
    src: path.join(config.get('root'), config.get('apidoc.source')),
    dest: path.join(config.get('root'), config.get('apidoc.target'))
  }, done)
}
