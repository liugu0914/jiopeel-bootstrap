/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.3.1): modal.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

import $ from 'jquery'
import Ajax from './ajax'
import Tool from './tool'
import Util from './util'

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME               = 'modal'
const VERSION            = '4.3.1'
const DATA_KEY           = 'bs.modal'
const EVENT_KEY          = `.${DATA_KEY}`
const DATA_API_KEY       = '.data-api'
const JQUERY_NO_CONFLICT = $.fn[NAME]
const ESCAPE_KEYCODE     = 27 // KeyboardEvent.which value for Escape (Esc) key
const MINWIDHT           = 596

const Default = {
  backdrop : true,
  keyboard : true,
  focus    : true,
  show     : true,
  url      : ''
}

const DefaultType = {
  backdrop : '(boolean|string)',
  keyboard : 'boolean',
  focus    : 'boolean',
  show     : 'boolean',
  url      : 'string'
}

const Event = {
  HIDE              : `hide${EVENT_KEY}`,
  HIDDEN            : `hidden${EVENT_KEY}`,
  SHOW              : `show${EVENT_KEY}`,
  SHOWN             : `shown${EVENT_KEY}`,
  FOCUSIN           : `focusin${EVENT_KEY}`,
  RESIZE            : `resize${EVENT_KEY}`,
  CLICK_DISMISS     : `click.dismiss${EVENT_KEY}`,
  CLICK_REFLESH     : `click.reflesh${EVENT_KEY}`,
  CLICK_EXPAND      : `click.expand${EVENT_KEY}`,
  KEYDOWN_DISMISS   : `keydown.dismiss${EVENT_KEY}`,
  MOUSEUP_DISMISS   : `mouseup.dismiss${EVENT_KEY}`,
  MOUSEDOWN_DISMISS : `mousedown.dismiss${EVENT_KEY}`,
  CLICK_DATA_API    : `click${EVENT_KEY}${DATA_API_KEY}`
}

const ClassName = {
  SCROLLABLE         : 'modal-dialog-scrollable',
  SCROLLBAR_MEASURER : 'modal-scrollbar-measure',
  BACKDROP           : 'modal-backdrop',
  OPEN               : 'modal-open',
  FADE               : 'fade',
  SHOW               : 'show',
  EXPAND_YES         : 'cs cs-suoxiao pointer',
  EXPAND_NO          : 'cs cs-fangda pointer'
}

const Selector = {
  DIALOG         : '.modal-dialog',
  MODAL_CONTENT  : '.modal-content',
  MODAL_BODY     : '.modal-body',
  DATA_TOGGLE    : '[target="modal"]',
  DATA_DISMISS   : '[target="modal-close"]',
  DATA_EXPAND    : '[target="modal-expand"]',
  DATA_REFLESH   : '[target="modal-reflesh"]',
  FIXED_CONTENT  : '.fixed-top, .fixed-bottom, .is-fixed, .sticky-top',
  STICKY_CONTENT : '.sticky-top'
}

const Customer = {
  CHECK          : 'chk',
  BEFORE         : 'bef',
  CUSTOM        : 'cus',
  END            : 'end'
}


/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class ModalCopy {
  constructor(element, config) {
    this._config              = this._getConfig(config)
    this._element             = element
    this._dialog              = element.querySelector(Selector.DIALOG)
    this._data                = {}
    this._backdrop            = null
    this._isShown             = false
    this._isBodyOverflowing   = false
    this._ignoreBackdropClick = false
    this._isTransitioning     = false
    this._scrollbarWidth      = 0
  }

  // Getters

  static get VERSION() {
    return VERSION
  }

  static get Default() {
    return Default
  }

  // Public

  toggle(relatedTarget) {
    return this._isShown ? this.hide() : this.show(relatedTarget)
  }

  show(relatedTarget) {
    if (this._isShown || this._isTransitioning) {
      return
    }
    const $this = $(relatedTarget)
    const $target = $(this._element).one(Event.SHOW, (showEvent) => {
      if (showEvent.isDefaultPrevented()) {
        // Only register focus restorer if modal will actually get shown
        return
      }
      if (this._config['bs.tooltip']) {
        this._config['bs.tooltip'].hide()
      }
      const data = this._config.data
      // 在展示时判断Modal是否可以打开
      const chk = Tool.eval(this._config[Customer.CHECK])
      if (chk && typeof chk === 'function') {
        const flag = chk($this, $target, data)
        if (typeof flag === 'boolean' && !flag) {
          showEvent.flag = flag
          return
        }
      }

      // 自定义函数式  用于封装数据
      const cus = Tool.eval(this._config[Customer.CUSTOM])
      if (cus && typeof cus === 'object' && typeof cus.fuc === 'function') {
        const rescus = cus.fuc.call($this[0], ...cus.args)
        if (rescus && typeof rescus === 'object') {
          this._config.data = {
            ...data,
            ...rescus
          }
        } else if (typeof rescus === 'boolean' && !rescus) {
          showEvent.flag = rescus
          return
        }
      }

      // 修改需要传递的数据
      const bef = Tool.eval(this._config[Customer.BEFORE])
      if (bef && typeof bef === 'function') {
        const _data = bef($this, $target, data)
        this._config.data = {
          ...data,
          ...typeof _data === 'object' && _data ? _data : {}
        }
      }

      $target.one(Event.HIDDEN, () => {
      // 关闭时执行方法
        const end = Tool.eval(this._config[Customer.END])
        if (end && typeof end === 'function') {
          end($this, $target, data)
        }
        // if ($this.is(':visible')) {
        //   relatedTarget.focus()
        // }
      })
    })
    const showEvent = $.Event(Event.SHOW, {
      relatedTarget
    })
    $(this._element).trigger(showEvent)
    if (typeof showEvent.flag === 'boolean' && !showEvent.flag) {
      this._hideModal()
      return
    }
    if ($(this._element).hasClass(ClassName.FADE)) {
      this._isTransitioning = true
    }

    if (this._isShown || showEvent.isDefaultPrevented()) {
      return
    }

    this._isShown = true

    this.getReomteData()
    this._checkScrollbar()
    this._setScrollbar()

    this._adjustDialog()

    this._setEscapeEvent()
    this._setResizeEvent()

    $(this._element).on(
      Event.CLICK_DISMISS,
      Selector.DATA_DISMISS,
      (event) => this.hide(event)
    )

    $(this._element).on(
      Event.CLICK_EXPAND,
      Selector.DATA_EXPAND,
      (event) => this.expand(event)
    )

    $(this._element).on(
      Event.CLICK_REFLESH,
      Selector.DATA_REFLESH,
      () => this.reflesh()
    )

    $(this._dialog).on(Event.MOUSEDOWN_DISMISS, () => {
      $(this._element).one(Event.MOUSEUP_DISMISS, (event) => {
        if ($(event.target).is(this._element)) {
          this._ignoreBackdropClick = true
        }
      })
    })

    this._showBackdrop(() => this._showElement(relatedTarget))
  }

  hide(event) {
    if (event) {
      event.preventDefault()
    }

    if (!this._isShown || this._isTransitioning) {
      return
    }

    const hideEvent = $.Event(Event.HIDE)

    $(this._element).trigger(hideEvent)

    if (!this._isShown || hideEvent.isDefaultPrevented()) {
      return
    }

    this._isShown = false
    const transition = $(this._element).hasClass(ClassName.FADE)

    if (transition) {
      this._isTransitioning = true
    }

    this._setEscapeEvent()
    this._setResizeEvent()


    $(document).off(Event.FOCUSIN)

    $(this._element).removeClass(ClassName.SHOW)

    $(this._element).off(Event.CLICK_DISMISS)
    $(this._element).off(Event.CLICK_REFLESH)
    $(this._element).off(Event.CLICK_EXPAND)
    $(this._dialog).off(Event.MOUSEDOWN_DISMISS)


    if (transition) {
      const transitionDuration  = Util.getTransitionDurationFromElement(this._element)

      $(this._element)
        .one(Util.TRANSITION_END, (event) => this._hideModal(event))
        .emulateTransitionEnd(transitionDuration)
    } else {
      this._hideModal()
    }
  }
  getReomteData() {
    // http/https url
    const HttpUrlReg = /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\\.,@?^=%&:/~\\+#]*[\w\-\\@?^=%&/~\\+#])?/i

    // 内部调用地址
    const OwnUrlReg = /([\w\-\\.,@?^=%&:/~\\+#]*[\w\-\\@?^=%&/~\\+#])?/i

    // 远程地址
    const url = this._config.url

    // 远程地址无效 直接返回
    if (!url || url && !HttpUrlReg.test(url) && !OwnUrlReg.test(url)) {
      return
    }
    // 拉取远程数据
    const op = {
      url,
      contentType : Ajax.APPLICATION_X_WWW_FORM_URLENCODED,
      data : this._config.data || {},
      type : Ajax.POST,
      dataType: Ajax.HTML,
      success: (res) => $(this._element.querySelector(Selector.DIALOG)).html(res ? res : '').find(Selector.MODAL_CONTENT).initUI()
    }
    Ajax.send(op)
  }
  expand(event) {
    if (event) {
      event.preventDefault()
    }
    const data = this._data || {}
    const expand = !data.expand
    const newwd = expand ? 'calc(100% - 1rem)' : null
    const newhg = expand ? '100%' : null
    this._data = {
      ...data,
      ...{
        expand,
        newwd,
        newhg
      }
    }
    event.target.className = expand ? ClassName.EXPAND_YES : ClassName.EXPAND_NO
    this._resizeModal(newwd, newhg)
    // 调整模态
    $(window).trigger($.Event(Event.RESIZE))
  }
  reflesh() {
    const hideEvent = $.Event(Event.HIDE)
    $(this._element).trigger(hideEvent)

    this.getReomteData()
    const expend = this._dialog.querySelector(Selector.DATA_EXPAND)
    if (expend) {
      expend.className = this._data.expand ? ClassName.EXPAND_YES : ClassName.EXPAND_NO
    }
    this._resizeModal(this._data.newwd, this._data.newhg)
    // 调整模态
    $(window).trigger($.Event(Event.RESIZE))
  }
  dispose() {
    [window, this._element, this._dialog]
      .forEach((htmlElement) => $(htmlElement).off(EVENT_KEY))

    /**
     * `document` has 2 events `Event.FOCUSIN` and `Event.CLICK_DATA_API`
     * Do not move `document` in `htmlElements` array
     * It will remove `Event.CLICK_DATA_API` event that should remain
     */
    $(document).off(Event.FOCUSIN)

    $.removeData(this._element, DATA_KEY)

    this._config              = null
    this._element             = null
    this._dialog              = null
    this._backdrop            = null
    this._isShown             = null
    this._isBodyOverflowing   = null
    this._ignoreBackdropClick = null
    this._isTransitioning     = null
    this._scrollbarWidth      = null
  }

  handleUpdate() {
    this._adjustDialog()
    if (this._element.offsetWidth <= MINWIDHT) {
      if (!this._data.expand) {
        this._dialog.style = null
        this._dialog.querySelector('.modal-content').style = null
      }
    } else {
      this._resizeModal(this._data.newwd, this._data.newhg)
    }
  }

  // Private

  _getConfig(config) {
    config = {
      ...Default,
      ...config
    }
    Util.typeCheckConfig(NAME, config, DefaultType)
    return config
  }

  _showElement(relatedTarget) {
    const transition = $(this._element).hasClass(ClassName.FADE)

    if (!this._element.parentNode ||
        this._element.parentNode.nodeType !== Node.ELEMENT_NODE) {
      // Don't move modal's DOM position
      document.body.appendChild(this._element)
    }

    this._element.style.display = 'block'
    this._element.removeAttribute('aria-hidden')
    this._element.setAttribute('aria-modal', true)

    if ($(this._dialog).hasClass(ClassName.SCROLLABLE)) {
      this._dialog.querySelector(Selector.MODAL_BODY).scrollTop = 0
    } else {
      this._element.scrollTop = 0
    }

    if (transition) {
      Util.reflow(this._element)
    }

    $(this._element).addClass(ClassName.SHOW)

    if (this._config.focus) {
      this._enforceFocus()
    }

    const shownEvent = $.Event(Event.SHOWN, {
      relatedTarget
    })

    const transitionComplete = () => {
      if (this._config.focus) {
        this._element.focus()
      }
      this._isTransitioning = false
      $(this._element).trigger(shownEvent)
    }

    if (transition) {
      const transitionDuration  = Util.getTransitionDurationFromElement(this._dialog)

      $(this._dialog)
        .one(Util.TRANSITION_END, transitionComplete)
        .emulateTransitionEnd(transitionDuration)
    } else {
      transitionComplete()
    }
    // 触发调整模态
    $(window).trigger($.Event(Event.RESIZE))
  }

  _enforceFocus() {
    $(document)
      .off(Event.FOCUSIN) // Guard against infinite focus loop
      .on(Event.FOCUSIN, (event) => {
        if (document !== event.target &&
            this._element !== event.target &&
            $(this._element).has(event.target).length === 0) {
          this._element.focus()
        }
      })
  }

  _setEscapeEvent() {
    if (this._isShown && this._config.keyboard) {
      $(this._element).on(Event.KEYDOWN_DISMISS, (event) => {
        if (event.which === ESCAPE_KEYCODE) {
          event.preventDefault()
          this.hide()
        }
      })
    } else if (!this._isShown) {
      $(this._element).off(Event.KEYDOWN_DISMISS)
    }
  }

  _setResizeEvent() {
    if (this._isShown) {
      $(window).on(Event.RESIZE, (event) => this.handleUpdate(event))
    } else {
      $(window).off(Event.RESIZE)
    }
  }

  _hideModal() {
    this._element.style.display = 'none'
    this._element.setAttribute('aria-hidden', true)
    this._element.removeAttribute('aria-modal')
    this._isTransitioning = false
    this._showBackdrop(() => {
      $(document.body).removeClass(ClassName.OPEN)
      this._resetAdjustments()
      this._resetScrollbar()
      $(this._element).trigger(Event.HIDDEN)
      $(this._element).remove()
    })
  }

  _removeBackdrop() {
    if (this._backdrop) {
      $(this._backdrop).remove()
      this._backdrop = null
    }
  }

  _showBackdrop(callback) {
    const animate = $(this._element).hasClass(ClassName.FADE)
      ? ClassName.FADE : ''

    if (this._isShown && this._config.backdrop) {
      this._backdrop = document.createElement('div')
      this._backdrop.className = ClassName.BACKDROP

      if (animate) {
        this._backdrop.classList.add(animate)
      }

      $(this._backdrop).appendTo(document.body)

      $(this._element).on(Event.CLICK_DISMISS, (event) => {
        if (this._ignoreBackdropClick) {
          this._ignoreBackdropClick = false
          return
        }
        if (event.target !== event.currentTarget) {
          return
        }
        if (this._config.backdrop === 'static') {
          this._element.focus()
        } else {
          this.hide()
        }
      })

      if (animate) {
        Util.reflow(this._backdrop)
      }

      $(this._backdrop).addClass(ClassName.SHOW)

      if (!callback) {
        return
      }

      if (!animate) {
        callback()
        return
      }

      const backdropTransitionDuration = Util.getTransitionDurationFromElement(this._backdrop)

      $(this._backdrop)
        .one(Util.TRANSITION_END, callback)
        .emulateTransitionEnd(backdropTransitionDuration)
    } else if (!this._isShown && this._backdrop) {
      $(this._backdrop).removeClass(ClassName.SHOW)

      const callbackRemove = () => {
        this._removeBackdrop()
        if (callback) {
          callback()
        }
      }

      if ($(this._element).hasClass(ClassName.FADE)) {
        const backdropTransitionDuration = Util.getTransitionDurationFromElement(this._backdrop)

        $(this._backdrop)
          .one(Util.TRANSITION_END, callbackRemove)
          .emulateTransitionEnd(backdropTransitionDuration)
      } else {
        callbackRemove()
      }
    } else if (callback) {
      callback()
    }
  }

  // ----------------------------------------------------------------------
  // the following methods are used to handle overflowing modals
  // todo (fat): these should probably be refactored out of modal.js
  // ----------------------------------------------------------------------

  _adjustDialog() {
    const isModalOverflowing =
      this._element.scrollHeight > document.documentElement.clientHeight

    if (!this._isBodyOverflowing && isModalOverflowing) {
      this._element.style.paddingLeft = `${this._scrollbarWidth}px`
    }

    if (this._isBodyOverflowing && !isModalOverflowing) {
      this._element.style.paddingRight = `${this._scrollbarWidth}px`
    }
  }

  _resetAdjustments() {
    this._element.style.paddingLeft = ''
    this._element.style.paddingRight = ''
  }

  _resizeModal(wd, hg) {
    const width = wd ? wd : this._config.width
    const height = hg ? hg : this._config.height
    if (width) {
      this._dialog.style.width = width
      this._dialog.style.maxWidth = 'none'
    } else {
      this._dialog.style = null
    }
    const content = this._dialog.querySelector('.modal-content')
    if (height) {
      content.style.height = height
      content.style.minHeight = 'unset'
    } else {
      content.style = null
    }
  }

  _checkScrollbar() {
    this._resizeModal()
    const rect = document.body.getBoundingClientRect()
    this._isBodyOverflowing = rect.left + rect.right < window.innerWidth
    this._scrollbarWidth = this._getScrollbarWidth()
  }

  _setScrollbar() {
    if (this._isBodyOverflowing) {
      // Note: DOMNode.style.paddingRight returns the actual value or '' if not set
      //   while $(DOMNode).css('padding-right') returns the calculated value or 0 if not set
      const fixedContent = [].slice.call(document.querySelectorAll(Selector.FIXED_CONTENT))
      const stickyContent = [].slice.call(document.querySelectorAll(Selector.STICKY_CONTENT))

      // Adjust fixed content padding
      $(fixedContent).each((index, element) => {
        const actualPadding = element.style.paddingRight
        const calculatedPadding = $(element).css('padding-right')
        $(element)
          .data('padding-right', actualPadding)
          .css('padding-right', `${parseFloat(calculatedPadding) + this._scrollbarWidth}px`)
      })

      // Adjust sticky content margin
      $(stickyContent).each((index, element) => {
        const actualMargin = element.style.marginRight
        const calculatedMargin = $(element).css('margin-right')
        $(element)
          .data('margin-right', actualMargin)
          .css('margin-right', `${parseFloat(calculatedMargin) - this._scrollbarWidth}px`)
      })

      // Adjust body padding
      const actualPadding = document.body.style.paddingRight
      const calculatedPadding = $(document.body).css('padding-right')
      $(document.body)
        .data('padding-right', actualPadding)
        .css('padding-right', `${parseFloat(calculatedPadding) + this._scrollbarWidth}px`)
    }

    $(document.body).addClass(ClassName.OPEN)
  }

  _resetScrollbar() {
    // Restore fixed content padding
    const fixedContent = [].slice.call(document.querySelectorAll(Selector.FIXED_CONTENT))
    $(fixedContent).each((index, element) => {
      const padding = $(element).data('padding-right')
      $(element).removeData('padding-right')
      element.style.paddingRight = padding ? padding : ''
    })

    // Restore sticky content
    const elements = [].slice.call(document.querySelectorAll(`${Selector.STICKY_CONTENT}`))
    $(elements).each((index, element) => {
      const margin = $(element).data('margin-right')
      if (typeof margin !== 'undefined') {
        $(element).css('margin-right', margin).removeData('margin-right')
      }
    })

    // Restore body padding
    const padding = $(document.body).data('padding-right')
    $(document.body).removeData('padding-right')
    document.body.style.paddingRight = padding ? padding : ''
  }

  _getScrollbarWidth() { // thx d.walsh
    const scrollDiv = document.createElement('div')
    scrollDiv.className = ClassName.SCROLLBAR_MEASURER
    document.body.appendChild(scrollDiv)
    const scrollbarWidth = scrollDiv.getBoundingClientRect().width - scrollDiv.clientWidth
    document.body.removeChild(scrollDiv)
    return scrollbarWidth
  }

  // Static
  static _jQueryInterface(config, relatedTarget) {
    return this.each(function () {
      let data = $(this).data(DATA_KEY)
      const _config = {
        ...Default,
        ...typeof config === 'object' && config ? config : {}
      }
      if (relatedTarget) {
        _config.url = _config.url || relatedTarget.getAttribute('href')
        _config.data = $(relatedTarget).data()
        _config.width = relatedTarget.getAttribute('m-wd')
        _config.height = relatedTarget.getAttribute('m-hg')
      }
      if (!data) {
        data = new ModalCopy(this, _config)
        $(this).data(DATA_KEY, data)
      }

      if (typeof config === 'string') {
        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`)
        }
        data[config](relatedTarget)
      } else if (_config.show) {
        data.show(relatedTarget)
      }
    })
  }
}

/**
 * ------------------------------------------------------------------------
 * Data Api implementation customer by lyc
 * ------------------------------------------------------------------------
 */

$(document).on(Event.CLICK_DATA_API, Selector.DATA_TOGGLE, function (event) {
  $(this).blur()
  let target
  const selector = Util.createDefaultModal(NAME)
  const $this = $(this)
  if (selector) {
    target = document.querySelector(selector)
  }
  const config = $(target).data(DATA_KEY)
    ? 'toggle' : {
      ...$(target).data(),
      ...$this.data()
    }
  if (this.tagName === 'A' || this.tagName === 'AREA') {
    event.preventDefault()
  }
  ModalCopy._jQueryInterface.call($(target), config, this)
})

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 */

$.fn[NAME] = ModalCopy._jQueryInterface
$.fn[NAME].Constructor = ModalCopy
$.fn[NAME].noConflict = () => {
  $.fn[NAME] = JQUERY_NO_CONFLICT
  return ModalCopy._jQueryInterface
}

export default ModalCopy
