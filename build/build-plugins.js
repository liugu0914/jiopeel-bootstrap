/*!
 * Script to build our plugins to use them separately.
 * Copyright 2019 The Bootstrap Authors
 * Copyright 2019 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */

'use strict'

const path = require('path')
const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const banner = require('./banner.js')

const TEST = process.env.NODE_ENV === 'test'
const plugins = [
  babel({
    exclude: 'node_modules/**', // Only transpile our source code
    externalHelpersWhitelist: [ // Include only required helpers
      'defineProperties',
      'createClass',
      'inheritsLoose',
      'defineProperty',
      'objectSpread'
    ]
  })
]
const bsPlugins = {
  Ajax: path.resolve(__dirname, '../js/src/ajax.js'),
  Alert: path.resolve(__dirname, '../js/src/alert.js'),
  Button: path.resolve(__dirname, '../js/src/button.js'),
  Carousel: path.resolve(__dirname, '../js/src/carousel.js'),
  Collapse: path.resolve(__dirname, '../js/src/collapse.js'),
  Confirm: path.resolve(__dirname, '../js/src/confirm.js'),
  Dropdown: path.resolve(__dirname, '../js/src/dropdown.js'),
  Editor: path.resolve(__dirname, '../js/src/editor.js'),
  InitUI: path.resolve(__dirname, '../js/src/initUI.js'),
  Toast: path.resolve(__dirname, '../js/src/toast.js'),
  Menu: path.resolve(__dirname, '../js/src/menu.js'),
  MetisMenu: path.resolve(__dirname, '../js/src/metismenu.js'),
  Modal: path.resolve(__dirname, '../js/src/modal.js'),
  ModalCopy: path.resolve(__dirname, '../js/src/modalcopy.js'),
  Popover: path.resolve(__dirname, '../js/src/popover.js'),
  ScrollSpy: path.resolve(__dirname, '../js/src/scrollspy.js'),
  Tab: path.resolve(__dirname, '../js/src/tab.js'),
  Tree: path.resolve(__dirname, '../js/src/tree.js'),
  Tool: path.resolve(__dirname, '../js/src/tool.js'),
  Tooltip: path.resolve(__dirname, '../js/src/tooltip.js'),
  Util: path.resolve(__dirname, '../js/src/util.js'),
  Upload: path.resolve(__dirname, '../js/src/upload.js'),
  Zoom: path.resolve(__dirname, '../js/src/zoom.js'),
  Catalog: path.resolve(__dirname, '../js/src/catalog.js'),
  Comments: path.resolve(__dirname, '../js/src/comments.js')
}
const rootPath = TEST ? '../js/coverage/dist/' : '../js/dist/'

function build(plugin) {
  console.log(`Building ${plugin} plugin...`)

  const external = ['jquery', 'popper.js']
  const globals = {
    jquery: 'jQuery', // Ensure we use jQuery which is always available even in noConflict mode
    'popper.js': 'Popper'
  }

  // Do not bundle Util in plugins
  if (plugin !== 'Ajax') {
    external.push(bsPlugins.Ajax)
    globals[bsPlugins.Ajax] = 'Ajax'
  }

  // Do not bundle Util in plugins
  if (plugin !== 'Tool') {
    external.push(bsPlugins.Tool)
    globals[bsPlugins.Tool] = 'Tool'
  }

  // Do not bundle Util in plugins
  if (plugin !== 'Confirm') {
    external.push(bsPlugins.Confirm)
    globals[bsPlugins.Confirm] = 'Confirm'
  }

  // Do not bundle Util in plugins
  if (plugin !== 'Toast') {
    external.push(bsPlugins.Toast)
    globals[bsPlugins.Toast] = 'Toast'
  }

  // Do not bundle Util in plugins
  if (plugin !== 'Util') {
    external.push(bsPlugins.Util)
    globals[bsPlugins.Util] = 'Util'
  }

  // Do not bundle Tooltip in plugins
  if (plugin !== 'Tree') {
    external.push(bsPlugins.Tree)
    globals[bsPlugins.Tree] = 'Tree'
  }

  // Do not bundle Upload in plugins
  if (plugin !== 'Upload') {
    external.push(bsPlugins.Upload)
    globals[bsPlugins.Upload] = 'Upload'
  }

  // Do not bundle Upload in plugins
  if (plugin !== 'Zoom') {
    external.push(bsPlugins.Zoom)
    globals[bsPlugins.Zoom] = 'Zoom'
  }

  // Do not bundle Menu in plugins
  if (plugin !== 'Menu') {
    external.push(bsPlugins.Menu)
    globals[bsPlugins.Menu] = 'Menu'
  }

    // Do not bundle MetisMenu in plugins
    if (plugin !== 'MetisMenu') {
      external.push(bsPlugins.MetisMenu)
      globals[bsPlugins.MetisMenu] = 'MetisMenu'
    }

  // Do not bundle Editor in Popover
  if (plugin !== 'Editor') {
    external.push(bsPlugins.Editor)
    globals[bsPlugins.Editor] = 'Editor'
  }

  // Do not bundle Tooltip in Popover
  if (plugin === 'Popover') {
    external.push(bsPlugins.Tooltip)
    globals[bsPlugins.Tooltip] = 'Tooltip'
  }

  const pluginFilename = `${plugin.toLowerCase()}.js`

  rollup.rollup({
    input: bsPlugins[plugin],
    plugins,
    external
  }).then((bundle) => {
    bundle.write({
      banner: banner(pluginFilename),
      format: 'umd',
      name: plugin,
      sourcemap: true,
      globals,
      file: path.resolve(__dirname, `${rootPath}${pluginFilename}`)
    })
      .then(() => console.log(`Building ${plugin} plugin... Done!`))
      .catch((err) => console.error(`${plugin}: ${err}`))
  })
}

Object.keys(bsPlugins).forEach((plugin) => build(plugin))
