const path = require('path')
const gulp = require('gulp')
const notify = require('../lib/notify')
const config = require('../config')

module.exports = function lintSCSS () {
  const linter = require('@ronilaukkarinen/gulp-stylelint')

  return gulp
    .src([
      path.join(config.get('assets.css'), '*.scss'),
      path.join(config.get('assets.css'), '**', '*.scss')
    ])
    .pipe(linter({
      failAfterError: false,
      reporters: [
        {
          formatter: (report) => {
            report
              .filter(file => file.errored)
              .forEach((file, i) => {
                const source = file.source.substr(config.get('root').length + 1)
                file.warnings.forEach((row) => {
                  console.log(`${source} ${row.line}:${row.column}: ${row.text}`)
                })

                if (i > 5) {
                  return
                }

                notify({
                  title: source,
                  message: file.warnings.map((row) => `${row.line}:${row.column}: ${row.text}`).join('\n')
                })
              })
          }
        }
      ]
    }))
}
