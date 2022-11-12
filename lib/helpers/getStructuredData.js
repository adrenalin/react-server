/* eslint-disable quote-props */
const { castToArray } = require('@adrenalin/helpers.js')

module.exports = function getStructuredData (metadata) {
  const structured = {
    '@context': 'https://schema.org',
    '@type': metadata.get('page', 'type', 'WebPage'),
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': metadata.get('http', 'fullUrl')
    },
    'headline': metadata.get('page', 'title'),
    'description': metadata.get('page', 'description'),
    'isAccessibleForFree': metadata.get('site', 'isFree') ? 'True' : 'False',
    'published': metadata.get('page', 'published'),
    'publisher': {
      'name': metadata.get('site', 'provider'),
      '@type': metadata.get('site', 'type', 'Organization'),
      'logo': {
        '@type': 'ImageObject',
        'url': metadata.get('site', 'logo', '/images/logo.svg')
      }
    },
    'hasPart': {
      '@type': 'WebPageElement',
      'isAccessibleForFree': metadata.get('page', 'isFree') ? 'True' : 'False',
      'cssSelector': metadata.get('page', 'paywallMask')
    }
  }

  const image = castToArray(metadata.get('opengraph', 'og:image'))[0]

  if (image) {
    structured.image = image
  }

  return `<script type="application/ld+json">${JSON.stringify(structured)}</script>`
}
