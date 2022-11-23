const fs = require('fs')
const path = require('path')
const gulp = require('gulp')
const babel = require('gulp-babel')

const config = require('./gulp/config')
config.set('root', __dirname)

const buildClient = require('./gulp/tasks/buildClient')

const babelrcRaw = fs.readFileSync(path.join(__dirname, '.babelrc'))
const babelrc = JSON.parse(babelrcRaw)

// @PATCH: create a symlink to reactstrap
const reactstrap = path.join(__dirname.replace(/node_modules.*/, 'node_modules'), 'reactstrap', 'dist')
const reactstrapTarget = path.join(reactstrap, 'reactstrap.cjs.js')

if (reactstrap.includes('node_modules') && fs.existsSync(reactstrap) && !fs.existsSync(reactstrapTarget)) {
  fs.symlinkSync('reactstrap.cjs', reactstrapTarget)
}

// Build client that uses ES6 + JSX
buildClient()
