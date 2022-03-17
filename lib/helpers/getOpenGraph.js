const { castToArray, getValue } = require('@adrenalin/helpers.js')

/**
 * Get OpenGraph metadata
 *
 * @param { Metadata } metadata     Request metadata
 * @param { request } req           Request
 * @param { response } res          Response
 * @return { object }               Open Graph metadata
 */
module.exports = function getOpenGraph (metadata, req, res) {
  const siteUrl = getValue(res, 'locals.data.ApplicationStore.siteUrl')
  const fullUrl = getValue(res, 'locals.data.ApplicationStore.fullUrl')

  const og = {
    ...req.config.get('opengraph', {}),
    'og:url': fullUrl,
    'og:type': metadata.get('opengraph', 'og:type') || 'website',
    'og:title': metadata.get('page', 'title'),
    'og:site_name': metadata.get('site', 'title') || req.config.get('site.title'),
    'og:locale': req.config.get(`locales.${req.lang}`) || req.config.get('defaultLocale'),
    'og:description': metadata.get('page', 'description'),
    'og:image': castToArray(metadata.get('opengraph', 'og:image'))
  }

  if (req.config.get('application.site.image')) {
    og['og:image'].push(req.config.get('application.site.image'))
  }

  og['og:image']
    .filter(src => src)
    .forEach((src, i) => {
      if (src.match(/^\//)) {
        og['og:image'][i] = `${siteUrl}${src}`
      }
    })

  return og
}
