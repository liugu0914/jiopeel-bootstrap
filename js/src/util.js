/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.3.1): util.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

import $ from 'jquery'
import Ajax from './ajax.js'
/**
 * ------------------------------------------------------------------------
 * Private TransitionEnd Helpers
 * ------------------------------------------------------------------------
 */

const TRANSITION_END = 'transitionend'
const MAX_UID = 1000000
const MILLISECONDS_MULTIPLIER = 1000

// Shoutout AngusCroll (https://goo.gl/pxwQGp)
function toType(obj) {
  return {}.toString.call(obj).match(/\s([a-z]+)/i)[1].toLowerCase()
}

function getSpecialTransitionEndEvent() {
  return {
    bindType: TRANSITION_END,
    delegateType: TRANSITION_END,
    handle(event) {
      if ($(event.target).is(this)) {
        return event.handleObj.handler.apply(this, arguments) // eslint-disable-line prefer-rest-params
      }
      return undefined // eslint-disable-line no-undefined
    }
  }
}

function transitionEndEmulator(duration) {
  let called = false

  $(this).one(Util.TRANSITION_END, () => {
    called = true
  })

  setTimeout(() => {
    if (!called) {
      Util.triggerTransitionEnd(this)
    }
  }, duration)

  return this
}

function setTransitionEndSupport() {
  $.fn.emulateTransitionEnd = transitionEndEmulator
  $.event.special[Util.TRANSITION_END] = getSpecialTransitionEndEvent()
}

/**
 * --------------------------------------------------------------------------
 * Public Util Api
 * --------------------------------------------------------------------------
 */

const Util = {

  TRANSITION_END: 'bsTransitionEnd',

  getUID(prefix) {
    do {
      // eslint-disable-next-line no-bitwise
      prefix += ~~(Math.random() * MAX_UID) // "~~" acts like a faster Math.floor() here
    } while (document.getElementById(prefix))
    return prefix
  },

  getSelectorFromElement(element) {
    let selector = element.getAttribute('data-target')

    if (!selector || selector === '#') {
      const hrefAttr = element.getAttribute('href')
      selector = hrefAttr && hrefAttr !== '#' ? hrefAttr.trim() : ''
    }

    try {
      return document.querySelector(selector) ? selector : null
    } catch (err) {
      return null
    }
  },
  randomArray(array) {
    return array instanceof Array ? array[Math.floor(Math.random() * array.length)] : null
  },
  eval(value) {
    let fuc
    try {
      // eslint-disable-next-line no-new-func
      fuc = new Function(`return ${value}`)()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(`the value [${value}] is not function`)
    }
    return fuc
  },
  // First define default Modal on body
  // if Modal is not exist, create the default Modal
  // Modal's id is named 'modal'
  // ps:  Util.createDefaultModal(NAME,flag)
  // @param  : id the modal's name
  // @Param  : flag if flag is true ,the Modal will be create
  // @author : lyc
  // @Date   : 2020年05月13日17:00:21
  createDefaultModal(id, flag) {
    if (!id) {
      return null
    }
    let selector = `#${id}`
    let modalDIV
    try {
      modalDIV = document.querySelector(selector)
      selector = modalDIV ? selector : null
    } catch (err) {
      selector = null
    }
    // if '#modal' is not exist ,create the new modal
    if (!selector || flag && flag === true) {
      const ModalStr = `
      <div class="modal fade" id="${id}" role="dialog" >
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        </div>
      </div>`
      const div = document.createElement('div')
      div.innerHTML = ModalStr
      modalDIV = div.firstElementChild
      document.body.appendChild(modalDIV)
      selector = `#${id}`
    } else {
      modalDIV.querySelector('.modal-dialog').innerHTML = ''
    }
    return selector
  },

  getReomteData(_config, target) {
    // http/https url
    const HttpUrlReg = /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\\.,@?^=%&:/~\\+#]*[\w\-\\@?^=%&/~\\+#])?/i

    // 内部调用地址
    const OwnUrlReg = /([\w\-\\.,@?^=%&:/~\\+#]*[\w\-\\@?^=%&/~\\+#])?/i

    // 远程地址
    const url = _config.url

    // 远程地址无效 直接返回
    if (!url || url && !HttpUrlReg.test(url) && !OwnUrlReg.test(url)) {
      return
    }
    // 拉取远程数据
    const op = {
      url,
      contentType : Ajax.APPLICATION_X_WWW_FORM_URLENCODED,
      data : _config.data || {},
      type : Ajax.POST,
      dataType: Ajax.HTML,
      success: (res) => $(target.querySelector('.modal-dialog')).html(res ? res : ''),
      error:(err) => $(target.querySelector('.modal-dialog')).html(err)
    }
    Ajax.send(op)
  },

  getTransitionDurationFromElement(element) {
    if (!element) {
      return 0
    }

    // Get transition-duration of the element
    let transitionDuration = $(element).css('transition-duration')
    let transitionDelay = $(element).css('transition-delay')

    const floatTransitionDuration = parseFloat(transitionDuration)
    const floatTransitionDelay = parseFloat(transitionDelay)

    // Return 0 if element or transition duration is not found
    if (!floatTransitionDuration && !floatTransitionDelay) {
      return 0
    }

    // If multiple durations are defined, take the first
    transitionDuration = transitionDuration.split(',')[0]
    transitionDelay = transitionDelay.split(',')[0]

    return (parseFloat(transitionDuration) + parseFloat(transitionDelay)) * MILLISECONDS_MULTIPLIER
  },

  reflow(element) {
    return element.offsetHeight
  },

  triggerTransitionEnd(element) {
    $(element).trigger(TRANSITION_END)
  },

  // TODO: Remove in v5
  supportsTransitionEnd() {
    return Boolean(TRANSITION_END)
  },

  isHTML(str) {
    const pattern = /<(?:[^"'>]|"[^"]*"|'[^']*')*>/ig
    return str && pattern.test(str)
  },

  isElement(obj) {
    return (obj[0] || obj).nodeType
  },

  typeCheckConfig(componentName, config, configTypes) {
    for (const property in configTypes) {
      if (Object.prototype.hasOwnProperty.call(configTypes, property)) {
        const expectedTypes = configTypes[property]
        const value = config[property]
        const valueType = value && Util.isElement(value)
          ? 'element' : toType(value)

        if (!new RegExp(expectedTypes).test(valueType)) {
          throw new Error(
            `${componentName.toUpperCase()}: ` +
            `Option "${property}" provided type "${valueType}" ` +
            `but expected type "${expectedTypes}".`)
        }
      }
    }
  },

  findShadowRoot(element) {
    if (!document.documentElement.attachShadow) {
      return null
    }

    // Can find the shadow root otherwise it'll return the document
    if (typeof element.getRootNode === 'function') {
      const root = element.getRootNode()
      return root instanceof ShadowRoot ? root : null
    }

    if (element instanceof ShadowRoot) {
      return element
    }

    // when we don't find a shadow root
    if (!element.parentNode) {
      return null
    }

    return Util.findShadowRoot(element.parentNode)
  }
}

setTransitionEndSupport()

export default Util
