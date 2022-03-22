import Iso from 'iso'
import React from 'react'
import { render } from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { Localization } from '@adrenalin/helpers.js'

import Application from './test/application'
import alt from './lib/alt'

// Silence the logger
Localization.registerLogger((type, locale) => {
  if (locale.key.match(/^[a-z]/) && locale.key.length > 1 && !locale.isVariable && window.location.hostname.match(/localhost/)) {
    console.debug(locale.key, 'missing')
  }
})

Iso.bootstrap((state, container) => {
  alt.bootstrap(state)
  render((
    <Application router={BrowserRouter} />
  ), document.getElementById('application'))
})
