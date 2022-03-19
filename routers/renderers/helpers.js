const path = require('path')

// React
const React = require('react')
const { StaticRouter } = require('react-router')
const { renderToString } = require('react-dom/server')

// Flux
const Iso = require('iso').default
const alt = require('../../client/lib/alt')

// Local components
const Logger = require('@adrenalin/logger')
const Metadata = require('../../client/lib/metadata')
const { buildUrl, castToArray, getValue, setValue } = require('@adrenalin/helpers.js')
const getStructuredData = require('../../lib/helpers/getStructuredData')
const getOpenGraph = require('../../lib/helpers/getOpenGraph')
const getMetaTags = require('../../lib/helpers/getMetaTags')

const getFingerPrint = require('../../lib/helpers/getFingerPrint')

module.exports = (app) => {
  const logger = new Logger('/routes/lib/renderers/helpers')
  let fingerprint

  getFingerPrint()
    .then((f) => {
      fingerprint = f
    })

  /**
   * Get suffix for the static files
   *
   * @return { string }               Git commit fingerprint
   */
  const getStaticFileSuffix = () => {
    if (!app.config.get('react.fingerprint')) {
      return ''
    }

    return `?${fingerprint}`
  }

  const getMinifiedFilename = (req, filename) => {
    if (!req.config.get('minified')) {
      return `${filename}${getStaticFileSuffix()}`
        .replace(/\.min/, '')
    }

    return `${filename}${getStaticFileSuffix()}`
      .replace(/\.min/, '')
      .replace(/\.([^.]+)$/, '.min.$1')
  }

  /**
   * Get link tags
   *
   * @param { request } req           HTTP request
   * @param { response } res          Response
   * @return { array }                Link tags
   */
  const getLinkTags = (req, res, err) => {
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
      const fullUrl = getValue(res, 'locals.data.ApplicationStore.fullUrl')
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
   * @param { request } req           HTTP request
   * @return { array }                JavaScript files
   */
  const getJavaScriptFiles = (req) => {
    const jsFiles = []

    if (req.config.get('minified')) {
      jsFiles.push(getMinifiedFilename(req, '/js/vendors.min.js'))
    }

    jsFiles.push(getMinifiedFilename(req, `/js/${req.config.get('entry')}.js`))

    return jsFiles
  }

  /**
   * Bind application to response
   */
  const bindApplication = (req, res) => {
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
  const bindIso = (res, reactHTML) => {
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
  const renderReactRequest = (err, req, res, next) => {
    try {
      const metadata = req.metadata || new Metadata()
      const entry = path.join(app.APPLICATION_ROOT, 'client', req.config.get('entry'), 'index.js')

      if (err) {
        metadata.set('http', 'status', err.statusCode || 500)
        setValue(res, 'locals.data.ErrorStore.error', err.message)

        if (err.errors) {
          setValue(res, 'locals.data.ErrorStore.errors', err.errors)
        }

        if (err.data) {
          setValue(res, 'locals.data.ErrorStore.data', err.data)
        }
      }

      const Client = require(entry)

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

      if (metadata.get('http', 'status')) {
        res.status(metadata.get('http', 'status'))
      }

      res.render('index.html', {
        locals: {
          html,
          castToArray,
          metadata,
          opengraph: getOpenGraph(metadata, req, res),
          metatags: getMetaTags(metadata, req, res),
          links: getLinkTags(req, res),
          jsFiles: getJavaScriptFiles(req),
          structured: getStructuredData(metadata)
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
