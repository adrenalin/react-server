const config = require('../config')

exports.buildApiDoc = require('./buildApiDoc')
exports.buildClient = require('./buildClient')
exports.bundler = require(`./${config.get('bundler')}`)
exports.compileStyles = require('./compileStyles')
exports.concatVendors = require('./concatVendors')
exports.copyFiles = require('./copyFiles')
exports.copyFonts = require('./copyFonts')
exports.copyImages = require('./copyImages')
exports.copyJS = require('./copyJS')
exports.copyVendors = require('./copyVendors')
exports.fusebox = require('./fusebox')
exports.jsdoc = require('./jsdoc')
exports.lintSCSS = require('./lintSCSS')
exports.minifyJS = require('./minifyJS')
exports.minifyStyles = require('./minifyStyles')
exports.nodemon = require('./nodemon')
