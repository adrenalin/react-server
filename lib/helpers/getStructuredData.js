/* eslint-disable quote-props */
const { castToArray } = require('@vapaaradikaali/helpers.js')

module.exports = function getStructuredData (metadata) {
  const published = metadata.get('page', 'published', undefined)
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
    'published': published,
    'publisher': {
      'name': metadata.get('site', 'provider'),
      '@type': metadata.get('site', 'type', 'Organization'),
      'logo': {
        '@type': 'ImageObject',
        'url': metadata.get('site', 'logo', '/images/logo.svg')
      }
    },
    'hasPart': metadata.get('page', ['isFree', 'paywallMask'])
    ? {
        '@type': 'WebPageElement',
        'isAccessibleForFree': metadata.get('page', 'isFree') ? 'True' : 'False',
        'cssSelector': metadata.get('page', 'paywallMask')
      }
    : undefined
  }

  const image = castToArray(metadata.get('opengraph', 'og:image'))[0]

  if (image) {
    structured.image = image
  }

  return `<script type="application/ld+json">${JSON.stringify(structured, null, 2)}</script>`
}
