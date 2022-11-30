const config = require('../config')
const path = require('path')

process.env.PROJECT_ROOT = process.env.PROJECT_ROOT || config.get('root')

module.exports = function fusebox () {
  const { FuseBox, Babel7Plugin, JSONPlugin } = require('fuse-box')

  const env = config.get('environment', 'gui')
  const entry = config.get(`clients.${env}.entry`, env).replace(/(\.js)?$/, '.js')

  const fuseboxConfig = {
    homeDir: path.join(config.get('root'), config.get('clients.root')),
    target: 'browser@es6',
    output: path.join(config.get('root'), config.get('target.js'), entry),
    sourceMaps: true,
    plugins: [
      JSONPlugin(),
      Babel7Plugin({
        configFile: path.join('..', '.babelrc')
      })
    ]
  }

  const instructions = [
    '>',
    `/${entry}`
  ]

  fuseboxConfig.shim = {}
  Object.keys(config.get('vendors', {})).forEach((pkg) => {
    instructions.push(`-${pkg}`)
    fuseboxConfig.shim[pkg] = {
      exports: config.get(`vendors.${pkg}.exports`)
    }
  })

  const fuse = FuseBox.init(fuseboxConfig)
  fuse.bundle(`./${entry}`).instructions(instructions.join(' '))

  return fuse.run()
}
