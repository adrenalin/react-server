const Logger = require('@adrenalin/logger')
const Metadata = require('../../../client/lib/metadata')
const { castToArray, Localization } = require('@adrenalin/helpers.js')

const getOpenGraph = require('../../../lib/helpers/getOpenGraph')
const getMetaTags = require('../../../lib/helpers/getMetaTags')

module.exports = (app) => {
  const renderErrorPage = (err, req, res, next) => {
    const logger = new Logger('routes/lib/renderers/errors/html')
    logger.setLevel(3)

    const { getLinkTags, getJavaScriptFiles } = require('../helpers')(app)

    const metadata = req.metadata || new Metadata()
    res.status(err.statusCode || 500)

    const l10n = new Localization()
    l10n.setLang(req.lang || 'en')

    const status = err.statusCode || 500
    const title = `errorTitle${status}`
    const content = err.message || `errorMessage${status}`

    if (!metadata.get('page', 'title')) {
      metadata.set('page', 'title', l10n.get(title))
    }

    if (!metadata.get('site', 'title')) {
      metadata.set('site', 'title', req.config.get('application.site.title'))
    }

    const locals = {
      l10n,
      title,
      content,
      castToArray,
      metadata,
      opengraph: getOpenGraph(metadata, req, res),
      metatags: getMetaTags(metadata, req, res),
      links: getLinkTags(req, res, err),
      jsFiles: getJavaScriptFiles(req),
      // links: getLinkTags(req, res),
      // jsFiles: getJavaScriptFiles(req),
      structured: ''
    }

    res.render('error.html', { locals }, (renderErr, html) => {
      if (renderErr) {
        /* istanbul ignore next */
        return next(err)
      }

      locals.html = html
      res.render('index.html', { locals })
    })
  }

  return (err, req, res, next) => {
    renderErrorPage(err, req, res, next)
  }
}
