const fs = require('fs')
const path = require('path')

// @PATCH: create a symlink to reactstrap
const reactstrap = path.join(__dirname.replace(/node_modules.*/, 'node_modules'), '..', 'reactstrap', 'dist')
const reactstrapTarget = path.join(reactstrap, 'reactstrap.cjs.js')
console.log(reactstrap)

if (reactstrap.includes('node_modules') && fs.existsSync(reactstrap) && !fs.existsSync(reactstrapTarget)) {
  fs.symlinkSync('reactstrap.cjs', reactstrapTarget)
}
