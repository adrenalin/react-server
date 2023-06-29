const path = require('path')

// React
const React = require('react')
const { StaticRouter } = require('react-router')
const { renderToString } = require('react-dom/server')
const { buildUrl, castToArray, getValue, setValue } = require('@vapaaradikaali/helpers.js')
const Logger = require('@vapaaradikaali/logger')

// Flux
const Iso = require('iso').default

// Local components
const Metadata = require('../../../client/lib/metadata')
const getStructuredData = require('../../helpers/getStructuredData')
const getOpenGraph = require('../../helpers/getOpenGraph')
const getMetaTags = require('../../helpers/getMetaTags')

const getFingerPrint = require('../../helpers/getFingerPrint')
let alt

/* istanbul ignore next try to load the Alt as singleton */
try {
  alt = require('../../../dist/lib/alt')
} catch (err) {
  alt = require('../../../client/lib/alt')
}

let fingerprint

/**
 * Get suffix for the static files
 *
 * @function getStaticFileSuffix
 * @param { request } req           HTTP request
 * @return { string }               Git commit fingerprint
 */
function getStaticFileSuffix (req) {
  if (!req.config.get('fingerprint')) {
    return ''
  }

  return `?${fingerprint}`
}

/**
 * Get minified filename
 *
 * @function getMinifiedFilename
 * @param { request } req           HTTP request
 * @param { string } filename       Filename
 * @return { string }               Git commit fingerprint
 */
function getMinifiedFilename (req, filename) {
  if (!req.config.get('minified')) {
    return `${filename}${getStaticFileSuffix(req)}`
      .replace(/\.min/, '')
  }

  return `${filename}${getStaticFileSuffix(req)}`
    .replace(/\.min/, '')
    .replace(/\.([^.]+)$/, '.min.$1')
}

/**
 * Get link tags
 *
 * @function getLinkTags
 * @param { request } req           HTTP request
 * @param { response } res          Response
 * @return { array }                Link tags
 */
function getLinkTags (req, res, err) {
  // Links
  const links = []

  req.config.get('stylesheets', [])
    .forEach((href) => {
      // href += `?${fingerprint}`
      links.push({
        rel: 'stylesheet',
        type: 'text/css',
        href: getMinifiedFilename(req, href)
      })
    })

  // Alternate languages
  if (!err) {
    const fullUrl = getValue(res, 'locals.data.ApplicationStore.fullUrl', req.originalUrl)
    const regex = new RegExp(`/${req.lang}($|/)`)
    const languages = req.config.get('application.languages', [])
    const locales = req.config.get('locales', {})

    languages
      .forEach((lang) => {
        // Omit link to self
        if (lang === req.lang) {
          return
        }

        const url = fullUrl.replace(regex, `/${lang}`)
        const locale = locales[lang] || `${lang}-${lang}`

        links.push({
          rel: 'alternate',
          href: url,
          hreflang: locale.replace(/_/, '-').toLowerCase()
        })
      })
  }

  return links
}

/**
 * Get JavaScript files
 *
 * @function getJavaScriptFiles
 * @param { request } req           HTTP request
 * @return { array }                JavaScript files
 */
function getJavaScriptFiles (req) {
  const jsFiles = []

  if (req.config.get('minified')) {
    jsFiles.push(getMinifiedFilename(req, '/js/vendors.min.js'))
  }

  jsFiles.push(getMinifiedFilename(req, `/js/${req.config.get('entry')}.js`))

  return jsFiles
}

/**
 * Renderer helpers
 *
 * @private
 * @function rendererHelpers
 * @param { express } app             Initialized application
 */
function rendererHelpers (app, options) {
  const logger = new Logger('@adrenalin/react-server/routers/renderers/helpers')
  const opts = {
    template: 'index.html',
    entry: 'application.js',
    ...(options || {})
  }

  getFingerPrint(app)
    .then((f) => {
      fingerprint = f
    })

  /**
   * Bind application to response
   */
  function bindApplication (req, res) {
    const parts = req.get('host').split(':')
    const host = req.config.get('host.name') || app.config.get('site.host.name') || parts[0]
    const port = req.config.get('host.port') || app.config.get('site.host.port') || Number(parts[1])
    const ssl = req.config.get('host.ssl') != null ? req.config.get('host.ssl') : app.config.get('site.host.ssl') || port === 443

    const siteUrl = buildUrl({
      protocol: ssl ? 'https' : 'http',
      host,
      port,
      location: ''
    }).replace(/\/$/, '')

    setValue(res, 'locals.data.ApplicationStore.siteUrl', siteUrl)
    setValue(res, 'locals.data.ApplicationStore.fullUrl', `${siteUrl}${req.originalUrl}`)
    setValue(res, 'locals.data.ApplicationStore.currentUrl', req.originalUrl)
    setValue(res, 'locals.data.ApplicationStore.location', req.url)
    setValue(res, 'locals.data.ApplicationStore.lang', req.lang)
    setValue(res, 'locals.data.ApplicationStore.errors', !!app.IS_DEVELOPMENT)
  }

  /**
   * Bind Alt stores to the HTML with Iso
   */
  function bindIso (res, reactHTML) {
    const stores = JSON.parse(alt.flush())
    const iso = new Iso()
    iso.add(reactHTML, JSON.stringify(stores))

    return iso.render().replace(/^<div/, '<div id="application"')
  }

  /**
   * Render React
   *
   * @param { Error } err             Error
   * @param { request } req           HTTP request
   * @param { response } res          HTTP response
   * @param { function } next         Next callback function
   */
  function renderReactRequest (err, req, res, next) {
    try {
      const metadata = res.metadata || new Metadata()
      const entry = path.join(app.APPLICATION_ROOT, 'client', req.config.get('entry'), opts.entry)

      if (err) {
        const status = err.statusCode || 500
        metadata.setStatusCode(status)
        setValue(res, 'locals.data.ErrorStore.error', err.message)

        if (err.errors) {
          setValue(res, 'locals.data.ErrorStore.errors', err.errors)
        }

        if (err.data) {
          setValue(res, 'locals.data.ErrorStore.data', err.data)
        }
      }

      const C = require(entry)
      const Client = C.default || C

      const context = {}
      const props = {
        location: req.url,
        context
      }

      /**
       * Render React
       *
       * @return { string }           Rendered React client
       */
      const renderReact = () => {
        try {
          return renderToString(React.createElement(Client, {
            router: StaticRouter,
            routerProps: props,
            metadata: metadata.values
          }))
        } catch (e) {
          logger.error('Caught an error when rendering React', e)
          props.errorLocation = props.location
          props.location = `/${req.lang}/servererror`

          app.services.events.emit('request:error', e, req, res)

          const html = renderToString(React.createElement(Client, {
            router: StaticRouter,
            routerProps: props,

            // Pass metadata values object as a reference so that changes to it
            // are readable in this context
            metadata: metadata.values
          }))

          metadata.set('http', 'status', 500)
          return html
        }
      }

      // Bind application store
      bindApplication(req, res)
      alt.bootstrap(JSON.stringify(res.locals.data))

      const reactHTML = renderReact({}, {})

      // @TODO: bind with Iso + Alt
      const html = bindIso(res, reactHTML)

      const statusCode = metadata.get('http', 'status')
      const location = metadata.get('http', 'location')

      if (statusCode) {
        res.status(statusCode)
      }

      if (location) {
        res.set('location', location)
      }

      res.render(req.config.get('template', opts.template), {
        locals: {
          html,
          castToArray,
          metadata,
          opengraph: getOpenGraph(metadata, req, res),
          metatags: getMetaTags(metadata, req, res),
          links: getLinkTags(req, res),
          jsFiles: getJavaScriptFiles(req),
          structured: getStructuredData(metadata),
          renderer: getValue(res, 'locals.data.renderer', {}),
          extra: getValue(res, 'locals.data.extra', {})
        }
      })
    } catch (err) {
      /* istanbul ignore next */
      logger.error(err)

      /* istanbul ignore next */
      next(err)
    }
  }

  return {
    getLinkTags,
    getStaticFileSuffix,
    getFingerPrint,
    getJavaScriptFiles,
    renderReactRequest,
    fingerprint
  }
}

rendererHelpers.getStaticFileSuffix = getStaticFileSuffix
rendererHelpers.getMinifiedFilename = getMinifiedFilename
rendererHelpers.getLinkTags = getLinkTags
rendererHelpers.getJavaScriptFiles = getJavaScriptFiles

module.exports = rendererHelpers
