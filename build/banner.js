'use strict'

const pkg = require('../package.json')
const author = 'lyc'
const year = new Date().getFullYear()

function getBanner(pluginFilename) {
  return `/*!
  * Bootstrap${pluginFilename ? ` ${pluginFilename}` : ''} v${pkg.version} (${pkg.homepage})
  * Copyright 2011-${year} ${author}
  */`
}

module.exports = getBanner
