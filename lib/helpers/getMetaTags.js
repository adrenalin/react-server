const { getValue } = require('@vapaaradikaali/helpers.js')

/**
 * Get response metadata
 *
 * @param { Metadata } metadata     Request metadata
 * @param { request } req           Request
 * @param { response } res          Response
 * @return { object }               Metadata
 */
module.exports = function getMetaTags (metadata, req, res) {
  return {
    // Dublin core meta tags
    'dc.description': metadata.get('page', 'description'),
    'dc.language': req.lang,
    'dc.title': metadata.get('page', 'title'),

    // Robots
    robots: metadata.get('page', 'robots') || getValue(res.getHeaders(), 'x-robots-tag')
  }
}
