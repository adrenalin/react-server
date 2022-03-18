const fs = require('fs')
const path = require('path')
const gulp = require('gulp')
const babel = require('gulp-babel')

const babelrcRaw = fs.readFileSync(path.join(__dirname, '.babelrc'))
const babelrc = JSON.parse(babelrcRaw)

console.log(path.join(__dirname, 'dist'))

// Build client that uses ES6 + JSX
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
