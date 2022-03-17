const path = require('path')
const ROOT_PATH = path.join(__dirname, '..')
const isDevelopment = process.env.NODE_ENV !== 'production'

process.env.PROJECT_ROOT = ROOT_PATH

const config = {
  root: ROOT_PATH,
  project: 'kemijarvi',
  environment: process.env.ENVIRONMENT || 'kemijarvi',
  development: isDevelopment,
  clients: {
    root: path.join(ROOT_PATH, 'client'),
    kemijarvi: {
      path: path.join(ROOT_PATH, 'client'),
      build: true,
      entry: 'kemijarvi.js'
    }
  },
  assets: {
    css: path.join(ROOT_PATH, 'assets', 'css'),
    files: path.join(ROOT_PATH, 'assets', 'files'),
    fonts: path.join(ROOT_PATH, 'assets', 'fonts'),
    images: path.join(ROOT_PATH, 'assets', 'images'),
    js: path.join(ROOT_PATH, 'assets', 'js')
  },
  apidoc: {
    watch: false, // Include watchers
    build: false, // Should API documentation be built when building
    source: path.join(ROOT_PATH, 'routes'),
    target: path.join(ROOT_PATH, 'build', 'static', 'apidoc')
  },
  target: {
    root: path.join(ROOT_PATH, 'build'),
    client: path.join(ROOT_PATH, 'build', 'client'),
    static: path.join(ROOT_PATH, 'build', 'static'),
    css: path.join(ROOT_PATH, 'build', 'static', 'css'),
    fonts: path.join(ROOT_PATH, 'build', 'static', 'fonts'),
    files: path.join(ROOT_PATH, 'build', 'static', 'files'),
    images: path.join(ROOT_PATH, 'build', 'static', 'images'),
    js: path.join(ROOT_PATH, 'build', 'static', 'js')
  },
  // External vendors - these will be bundled in production to vendors.js using
  // their minified production versions which are often hundeds of kB smaller
  vendors: {
    react: {
      exports: 'React',
      source: 'umd/react.production.min.js'
    },
    'react-dom': {
      exports: 'ReactDOM',
      source: 'umd/react-dom.production.min.js'
    },
    'react-router-dom': {
      exports: 'ReactRouterDOM',
      source: 'umd/react-router-dom.min.js'
    },
    'prop-types': {
      exports: 'PropTypes',
      source: 'prop-types.min.js'
    },
    moment: {
      exports: 'moment',
      source: 'min/moment.min.js'
    },
    axios: {
      exports: 'axios',
      source: 'dist/axios.min.js'
    }
  },
  eslint: {
    configFile: path.join(ROOT_PATH, '.eslintrc.json')
  }
}

config.useMinified = !config.development || process.env.USE_MINIFIED

// debug('config', config);

module.exports = config
