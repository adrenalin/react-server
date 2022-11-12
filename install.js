const fs = require('fs')
const path = require('path')
const gulp = require('gulp')
const babel = require('gulp-babel')

const babelrcRaw = fs.readFileSync(path.join(__dirname, '.babelrc'))
const babelrc = JSON.parse(babelrcRaw)

// @PATCH: create a symlink to reactstrap
const reactstrap = path.join(__dirname.replace(/node_modules.*/, 'node_modules'), 'reactstrap', 'dist')
const reactstrapTarget = path.join(reactstrap, 'reactstrap.cjs.js')

if (reactstrap.includes('node_modules') && fs.existsSync(reactstrap) && !fs.existsSync(reactstrapTarget)) {
  fs.symlinkSync('reactstrap.cjs', reactstrapTarget)
}

// Build client that uses ES6 + JSX
if (__dirname.includes('node_modules') || process.env.REACT_SERVER_FORCE_BUILD === 'true') {
  gulp
    .src([
      path.join(__dirname, 'client', '*.js'),
      path.join(__dirname, 'client', '**', '*.js')
    ])
    .pipe(babel(babelrc))
    .on('error', (err) => {
      console.error('Caught an error', err)
      process.exit(1)
    })
    .pipe(gulp.dest(path.join(__dirname, 'dist')))
}
