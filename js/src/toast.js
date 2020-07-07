import $ from 'jquery'

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME               = 'toast'
const VERSION            = '1.0.0'
const DATA_KEY           = 'lyc.toast'
const EVENT_KEY          = `.${DATA_KEY}`
const JQUERY_NO_CONFLICT = $[NAME]

const Event = {
  CLICK_DISMISS : `click.dismiss${EVENT_KEY}`
}

const PositionClasses =
['bottom-left',
  'bottom-right',
  'top-right',
  'top-left',
  'bottom-center',
  'top-center',
  'mid-center']

const DefaultIcons = ['success', 'error', 'info', 'warning']


const DefaultOptions = {
  text: '',
  heading: '',
  showHideTransition: 'fade',
  allowToastClose: true,
  hideAfter: 3000,
  loader: true,
  loaderBg: '#9EC600',
  stack: 5,
  position: 'top-center',
  bgColor: false,
  textColor: false,
  textAlign: 'left',
  icon: false,
  beforeShow() {
    return null
  },
  afterShown() {
    return null
  },
  beforeHide() {
    return null
  },
  afterHidden() {
    return null
  }
}
/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class Toast {
  constructor(_options) {
    this._toastEl = null
    this.options = this.prepareOptions(_options)
    this.process()
  }

  // Getters
  static get VERSION() {
    return VERSION
  }

  prepareOptions(options) {
    let _options = {}
    if (typeof options === 'string' || options instanceof Array) {
      _options.text = options
    } else {
      _options = typeof options === 'object' ? options : {}
    }
    return {
      ...DefaultOptions,
      ..._options
    }
  }

  process() {
    this.setup()
    this.addToDom()
    this.position()
    this.bindToast()
    this.animate()
  }

  setup() {
    let _toastContent = ''

    this._toastEl = this._toastEl || $('<div></div>', {
      class : 'jq-toast-single text-break'
    })

    // For the loader on top
    _toastContent += '<span class="jq-toast-loader"></span>'

    // if (this.options.allowToastClose) {
    //   _toastContent += '<span class="close-jq-toast-single">&times;</span>'
    // }

    if (this.options.text instanceof Array) {
      if (this.options.heading) {
        _toastContent += `<h2 class="jq-toast-heading">${this.options.heading}</h2>`
      }

      _toastContent += '<ul class="jq-toast-ul">'
      for (let i = 0; i < this.options.text.length; i++) {
        _toastContent += `<li class="jq-toast-li" id="jq-toast-item-${i}">${this.options.text[i]}</li>`
      }
      _toastContent += '</ul>'
    } else {
      if (this.options.heading) {
        _toastContent += `<h2 class="jq-toast-heading">${this.options.heading}</h2>`
      }
      _toastContent += this.options.text
    }

    this._toastEl.html(_toastContent)

    if (this.options.bgColor !== false) {
      this._toastEl.css('background-color', this.options.bgColor)
    }

    if (this.options.textColor !== false) {
      this._toastEl.css('color', this.options.textColor)
    }

    if (this.options.textAlign) {
      this._toastEl.css('text-align', this.options.textAlign)
    }

    if (this.options.icon !== false) {
      this._toastEl.addClass('jq-has-icon')

      if ($.inArray(this.options.icon, DefaultIcons) !== -1) {
        this._toastEl.addClass(`jq-icon-${this.options.icon}`)
      }
    }

    if (this.options.class !== false) {
      this._toastEl.addClass(this.options.class)
    }
  }

  position() {
    const two = 2
    if (typeof this.options.position === 'string' && $.inArray(this.options.position, PositionClasses) !== -1) {
      if (this.options.position === 'bottom-center') {
        this._container.css({
          left:  $(window).outerWidth() / two - this._container.outerWidth() / two,
          bottom: 20
        })
      } else if (this.options.position === 'top-center') {
        this._container.css({
          left:  $(window).outerWidth() / two - this._container.outerWidth() / two,
          top: 20
        })
      } else if (this.options.position === 'mid-center') {
        this._container.css({
          left:  $(window).outerWidth() / two - this._container.outerWidth() / two,
          top:  $(window).outerHeight() / two - this._container.outerHeight() / two
        })
      } else {
        this._container.addClass(this.options.position)
      }
    } else if (typeof this.options.position === 'object') {
      this._container.css({
        top : this.options.position.top ? this.options.position.top : 'auto',
        bottom : this.options.position.bottom ? this.options.position.bottom : 'auto',
        left : this.options.position.left ? this.options.position.left : 'auto',
        right : this.options.position.right ? this.options.position.right : 'auto'
      })
    } else {
      this._container.addClass('bottom-left')
    }
  }

  bindToast() {
    const that = this

    this._toastEl.on('afterShown', () => {
      that.processLoader()
    })
    if (this.options.allowToastClose) {
      this._toastEl.on(Event.CLICK_DISMISS, (e) => {
        e.preventDefault()

        if (that.options.showHideTransition === 'fade') {
          that._toastEl.trigger('beforeHide')
          that._toastEl.fadeOut(() => {
            that._toastEl.trigger('afterHidden')
          })
        } else if (that.options.showHideTransition === 'slide') {
          that._toastEl.trigger('beforeHide')
          that._toastEl.slideUp(() => {
            that._toastEl.trigger('afterHidden')
          })
        } else {
          that._toastEl.trigger('beforeHide')
          that._toastEl.hide(() => {
            that._toastEl.trigger('afterHidden')
          })
        }
      })
    }

    if (typeof this.options.beforeShow === 'function') {
      this._toastEl.on('beforeShow', () => {
        that.options.beforeShow()
      })
    }

    if (typeof this.options.afterShown === 'function') {
      this._toastEl.on('afterShown', () => {
        that.options.afterShown()
      })
    }

    if (typeof this.options.beforeHide === 'function') {
      this._toastEl.on('beforeHide', () => {
        that.options.beforeHide()
      })
    }

    if (typeof this.options.afterHidden === 'function') {
      this._toastEl.on('afterHidden', () => {
        that.options.afterHidden()
      })
    }
  }

  addToDom() {
    let _container = $('.jq-toast-wrap')

    if (_container.length === 0) {
      _container = $('<div></div>', {
        class: 'jq-toast-wrap',
        role: 'alert',
        'aria-live': 'polite'
      })

      $('body').append(_container)
    } else if (!this.options.stack || isNaN(parseInt(this.options.stack, 10))) {
      _container.empty()
    }

    _container.find('.jq-toast-single:hidden').remove()

    _container.append(this._toastEl)

    const ten = 10

    if (this.options.stack && !isNaN(Number(this.options.stack), ten)) {
      const _prevToastCount = _container.find('.jq-toast-single').length


      const _extToastCount = _prevToastCount - this.options.stack

      if (_extToastCount > 0) {
        $('.jq-toast-wrap').find('.jq-toast-single').slice(0, _extToastCount).remove()
      }
    }

    this._container = _container
  }

  canAutoHide() {
    return this.options.hideAfter !== false && !isNaN(parseInt(this.options.hideAfter, 10))
  }

  processLoader() {
    // Show the loader only, if auto-hide is on and loader is demanded
    if (!this.canAutoHide() || this.options.loader === false) {
      return false
    }

    const loader = this._toastEl.find('.jq-toast-loader')

    const newLocal = 400
    const milliseconds = 1000
    // 400 is the default time that jquery uses for fade/slide
    // Divide by 1000 for milliseconds to seconds conversion
    const transitionTime = `${(this.options.hideAfter - newLocal) / milliseconds}s`
    const loaderBg = this.options.loaderBg

    let style = loader.attr('style') || ''
    style = style.substring(0, style.indexOf('-webkit-transition')) // Remove the last transition definition

    style += `-webkit-transition: width ${transitionTime} ease-in; \
              -o-transition: width ${transitionTime} ease-in; \
              transition: width ${transitionTime} ease-in; \
              background-color: ${loaderBg};`


    return loader.attr('style', style).addClass('jq-toast-loaded')
  }

  animate() {
    this._toastEl.hide()

    this._toastEl.trigger('beforeShow')

    if (this.options.showHideTransition.toLowerCase() === 'fade') {
      this._toastEl.fadeIn(() => {
        this._toastEl.trigger('afterShown')
      })
    } else if (this.options.showHideTransition.toLowerCase() === 'slide') {
      this._toastEl.slideDown(() => {
        this._toastEl.trigger('afterShown')
      })
    } else {
      this._toastEl.show(() => {
        this._toastEl.trigger('afterShown')
      })
    }

    if (this.canAutoHide()) {
      window.setTimeout(() => {
        if (this.options.showHideTransition.toLowerCase() === 'fade') {
          this._toastEl.trigger('beforeHide')
          this._toastEl.fadeOut(() => {
            this._toastEl.trigger('afterHidden')
          })
        } else if (this.options.showHideTransition.toLowerCase() === 'slide') {
          this._toastEl.trigger('beforeHide')
          this._toastEl.slideUp(() => {
            this._toastEl.trigger('afterHidden')
          })
        } else {
          this._toastEl.trigger('beforeHide')
          this._toastEl.hide(() => {
            this._toastEl.trigger('afterHidden')
          })
        }
      }, this.options.hideAfter)
    }
  }

  // Staticx
  static suc(text) {
    const option = {
      heading: '成功',
      text,
      position: 'top-center',
      hideAfter :1500,
      stack: false,
      icon: 'success'
    }
    return new Toast(option)
  }

  static err(text) {
    const option = {
      heading: '错误',
      text,
      position: 'top-center',
      hideAfter :1500,
      stack: false,
      icon: 'error'
    }
    return new Toast(option)
  }

  static info(text) {
    const option = {
      heading: '提示',
      text,
      position: 'top-center',
      hideAfter :1500,
      stack: false,
      icon: 'info'
    }
    return new Toast(option)
  }

  static warn(text) {
    const option = {
      heading: '警告',
      text,
      position: 'top-center',
      hideAfter :1500,
      stack: false,
      icon: 'warning'
    }
    return new Toast(option)
  }

  static reset(resetWhat) {
    if (resetWhat === 'all') {
      $('.jq-toast-wrap').remove()
    } else {
      this._toastEl.remove()
    }
  }

  static update(options) {
    this.prepareOptions(options, this.options)
    this.setup()
    this.bindToast()
  }

  static _jQueryInterface(options) {
    return new Toast(options)
  }
}

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 */

$.extend({
  [NAME]:Toast._jQueryInterface
})
$[NAME].noConflict  = () => {
  $[NAME] = JQUERY_NO_CONFLICT
  return Toast._jQueryInterface
}

export default Toast
