// Initialize the first task
const path = require('path')
const gulp = require('gulp')

const task = process.argv[process.argv.length - 1]

gulp.task(task, require(path.join(__dirname, 'gulp', task)))
