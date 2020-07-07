/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.3.1): confirm.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

import $ from 'jquery'
import Util from './util'

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME               = 'confirm'
const VERSION            = '4.3.1'
const DATA_KEY           = 'bs.confirm'
const EVENT_KEY          = `.${DATA_KEY}`
const DEFAULT_ICON       = '<i class=\'cs cs-xinxi\'></i>'
const DEFAULT_CONFIRM    = `
                          <div class="toast fade" target="confirm">
                          <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                              <div class="toast-content {{toastClass}}" role="alert" aria-live="assertive" aria-atomic="true">
                                  <div class="toast-header">
                                      {{icon}}
                                      <strong class="ml-1 mr-auto">{{header}}</strong>
                                      <i class="cs cs-close pointer" target="confirm-no"></i>
                                  </div>
                                  <div class="toast-body">{{text}}</div>
                                  <div class="toast-footer">
                                      <button type="button" target="confirm-no" class="btn btn-light btn-xm mr-2">
                                          <span aria-hidden="true">取消</span>
                                      </button>
                                      <button type="button" target="confirm-ok" class="btn {{btnClass}} btn-xm">
                                          <span aria-hidden="true">确认</span>
                                      </button>
                                  </div>
                              </div>
                          </div>
                          </div>`

const Event = {
  CLICK_DISMISS : `click.dismiss${EVENT_KEY}`,
  HIDE          : `hide${EVENT_KEY}`,
  HIDDEN        : `hidden${EVENT_KEY}`,
  SHOW          : `show${EVENT_KEY}`,
  SHOWN         : `shown${EVENT_KEY}`
}

const ClassName = {
  FADE    : 'fade',
  HIDE    : 'hide',
  SHOW    : 'show',
  SHOWING : 'showing',
  OPEN    : 'modal-open',
  BACKDROP:'toast-backdrop',
  TOAST_FILLED:'toast-filled',
  BG_BTN     :'btn-outline-light',
  BTN_RIMARY :'btn-primary',
  BG_PRIMARY :'bg-primary',
  BG_INFO    :'bg-info',
  BG_DANGER  :'bg-danger',
  BG_WARNING :'bg-warning',
  BG_SUCCESS :'bg-success',
  BG_DARK    :'bg-dark'
}

const State = [
  'primary',
  'info',
  'danger',
  'warning',
  'success',
  'dark'
]

const position = ['bottom-left', 'bottom-right', 'top-right', 'top-left', 'bottom-center', 'top-center', 'mid-center']

const DefaultType = {
  animation : 'boolean',
  backdrop  : 'boolean',
  header    : 'string',
  text      : 'string',
  icon      : 'string',
  position  : '(string|object)',
  ok        : 'function',
  no        : 'function'
}

const Default = {
  animation : true,
  backdrop  : false,
  header    : 'JIOPEEL',
  text      : '',
  icon      : 'dark',
  position  : 'mid-center',
  ok() {
    return true
  },
  no() {
    return false
  }
}

const Selector = {
  DATA_CONFIRM : '[target="confirm"]',
  DATA_NO : '[target="confirm-no"]',
  DATA_OK : '[target="confirm-ok"]'
}

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class Confirm {
  constructor(config) {
    this._config    = this._getConfig(config)
    this._element   = this._createDIV()
    this._backdrop  = null
    this._isShown   = false
    this._flag      = false
    // this.show()
    this._setListeners()
    return this
  }

  // Getters

  static get VERSION() {
    return VERSION
  }

  static get DefaultType() {
    return DefaultType
  }

  static get Default() {
    return Default
  }

  // Public

  show() {
    $(this._element).trigger(Event.SHOW)
    this._isShown = true
    $(document.body).addClass(ClassName.OPEN)
    // 打开阴影层
    this._showBackdrop(() => this._showElement())
  }


  hide(flag) {
    if (!this._element.classList.contains(ClassName.SHOW)) {
      return
    }

    $(this._element).trigger(Event.HIDE)

    this._isShown = false

    this._close()
    // 打开阴影层
    this._showBackdrop(() => this._judge(flag))
  }

  dispose() {
    clearTimeout(this._timeout)
    this._timeout = null

    if (this._element.classList.contains(ClassName.SHOW)) {
      this._element.classList.remove(ClassName.SHOW)
    }

    $(this._element).off(Event.CLICK_DISMISS)

    $.removeData(this._element, DATA_KEY)
    this._element = null
    this._config  = null
  }


  ok(callback) {
    if (typeof callback === 'function') {
      this._config.ok = callback
    }
    return this
  }

  no(callback) {
    if (typeof callback === 'function') {
      this._config.no = callback
    }
    return this
  }

  over() {
    return this._flag
  }

  // Private


  _showElement() {
    if (this._config.animation) {
      this._element.classList.add(ClassName.FADE)
    }
    // this._position()
    const complete = () => {
      this._element.classList.add(ClassName.SHOW)

      $(this._element).trigger(Event.SHOWN)
    }

    this._element.classList.remove(ClassName.HIDE)

    this._element.style.display = 'block'

    if (this._config.animation) {
      const transitionDuration = Util.getTransitionDurationFromElement(this._element)

      $(this._element)
        .one(Util.TRANSITION_END, complete)
        .emulateTransitionEnd(transitionDuration)
    } else {
      complete()
    }
  }

  _judge(flag) {
    $(document.body).removeClass(ClassName.OPEN)
    this._flag = flag
    return flag ? this._config.ok() : this._config.no()
  }

  _getConfig(_config) {
    let config = {}
    if (typeof _config === 'string') {
      config.text = _config
    } else if (typeof _config === 'object' && _config) {
      config = _config
    }
    config = {
      ...Default,
      ...config
    }
    if (config.icon && config.icon === 'random') {
      let random = Util.randomArray(State)
      random = random ? random : ''
      config.icon = random
    }

    Util.typeCheckConfig(
      NAME,
      config,
      this.constructor.DefaultType
    )

    return config
  }
  _position() {
    const local = 2
    const _position = this._config.position
    const $this = $(this._element)
    if (typeof _position === 'string' && $.inArray(_position, position) !== -1) {
      if (_position === 'bottom-center') {
        $this.css({
          left:  $(window).outerWidth() / local - $this.outerWidth() / local,
          bottom: 20
        })
      } else if (_position === 'top-center') {
        $this.css({
          left:  $(window).outerWidth() / local - $this.outerWidth() / local,
          top: 20
        })
      } else if (_position === 'mid-center') {
        $this.css({
          left:  $(window).outerWidth() / local - $this.outerWidth() / local,
          top:  $(window).outerHeight() / local - $this.outerHeight() / local
        })
      } else {
        $this.addClass(_position)
      }
    } else if (typeof _position === 'object') {
      $this.css({
        top : _position.top ? _position.top : 'auto',
        bottom : _position.bottom ? _position.bottom : 'auto',
        left : _position.left ? _position.left : 'auto',
        right : _position.right ? _position.right : 'auto'
      })
    } else {
      $this.addClass('mid-center')
    }
  }

  _showBackdrop(callback) {
    const animate = $(this._element).hasClass(ClassName.FADE)
      ? ClassName.FADE : ''

    if (this._isShown) {
      this._backdrop = document.createElement('div')
      this._backdrop.className = ClassName.BACKDROP

      if (animate) {
        this._backdrop.classList.add(animate)
      }

      $(this._backdrop).appendTo(document.body)

      $(this._element).on(Event.CLICK_DISMISS, (event) => {
        if (!this._config.backdrop) {
          return
        }
        if (event.target !== event.currentTarget) {
          return
        }
        this.hide()
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
    } else { // 关闭阴影层
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
    }
  }

  _removeBackdrop() {
    if (this._backdrop) {
      $(this._backdrop).remove()
      this._backdrop = null
    }
  }

  _setListeners() {
    $(this._element).on(
      Event.CLICK_DISMISS,
      Selector.DATA_NO,
      () => this.hide(false)
    )
    $(this._element).on(
      Event.CLICK_DISMISS,
      Selector.DATA_OK,
      () => this.hide(true)
    )
  }

  _close() {
    const complete = () => {
      this._element.classList.add(ClassName.HIDE)
      $(this._element).trigger(Event.HIDDEN)
      $(this._element).remove()
      this._element = null
    }

    this._element.classList.remove(ClassName.SHOW)
    if (this._config.animation) {
      const transitionDuration = Util.getTransitionDurationFromElement(this._element)

      $(this._element)
        .one(Util.TRANSITION_END, complete)
        .emulateTransitionEnd(transitionDuration)
    } else {
      complete()
    }
  }

  _createDIV() {
    $(Selector.DATA_CONFIRM, document).remove()
    $(`.${ClassName.BACKDROP}`, document).remove()
    let div = DEFAULT_CONFIRM
    div = div.replace('{{header}}', this._config.header)
    div = div.replace('{{text}}', this._config.text)
    let icon = this._config.icon.trim()
    const iconName = icon.toUpperCase()
    for (const state in State) {
      if (icon === State[state]) {
        div = div.replace('{{toastClass}}', `${ClassName[`BG_${iconName}`]} ${ClassName.TOAST_FILLED}`)
        div = div.replace('{{btnClass}}', ClassName.BG_BTN)
        icon = DEFAULT_ICON
        break
      }
    }
    div = div.replace('{{toastClass}}', '')
    div = div.replace('{{btnClass}}', ClassName.BTN_RIMARY)
    icon = Util.isHTML(icon) ? icon : ''
    div = div.replace('{{icon}}', icon)
    const creatediv = document.createElement('div')
    creatediv.innerHTML = div
    return document.body.appendChild(creatediv.firstElementChild)
  }

  // Static
  static _jQueryInterface(config) {
    return new Confirm(config)
  }
}

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 */
$.extend({
  [NAME]:Confirm._jQueryInterface
})
export default Confirm
