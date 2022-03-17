const config = require('../config')
const gulp = require('gulp')
const path = require('path')
const { FuseBox, Babel7Plugin, JSONPlugin } = require('fuse-box')
const env = config.environment

const entry = env === 'whitelabel' ? 'zenostock' : env

const fuseboxConfig = {
  homeDir: path.join(process.env.PROJECT_ROOT, 'client'),
  target: 'browser@es6',
  output: `build/static/js/${env}.js`,
  sourceMaps: {
    project: true,
    vendor: false
  },
  plugins: [
    JSONPlugin(),
    Babel7Plugin({
      configFile: path.join('..', '.babelrc')
    })
  ]
}

const instructions = [
  '>',
  `/${entry}.js`
]

if (!config.development && config.vendors) {
  fuseboxConfig.shim = {}
  Object.keys(config.vendors).forEach((pkg) => {
    instructions.push(`-${pkg}`)
    fuseboxConfig.shim[pkg] = {
      exports: config.vendors[pkg].exports
    }
  })
}

const fuse = FuseBox.init(fuseboxConfig)
fuse.bundle(`./${entry}.js`).instructions(instructions.join(' '))

gulp.task('fusebox', () => {
  return fuse.run()
})

gulp.task('tasks/fusebox', gulp.series('fusebox'), () => {
  // Standalone task execution from cli
})
