import $ from 'jquery'

const NAME = 'zoom'
const VERSION = '1.0.0'
const DATA_KEY = 'lyc.zoom'
const EVENT_KEY = `.${DATA_KEY}`
let element = null

const Defaults = {
  styles: {
    zoomImage: {
      position: 'absolute',
      transition: 'transform 300ms',
      transform: 'translate3d(0, 0, 0) scale(1)',
      transformOrigin: 'center center',
      willChange: 'transform, top, left'
    },
    zoomContainer: {
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      zIndex: 1024
    },
    overlay: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: '#313a46',
      opacity: 0.7,
      transition: 'opacity 300ms'
    },
    btn: {
      position: 'absolute',
      bottom: 12,
      right: 12,
      padding: '4px 10px',
      border: '1px solid #e9e9e9',
      borderRadius: 2,
      fontSize: 12,
      color: '#999'
    },
    btnHover: {
      color: '#666'
    }
  }
}

const Event = {
  CLICK_ZOOM_IN: `click.in${EVENT_KEY}`,
  CLICK_ZOOM_OUT: `click.out${EVENT_KEY}`,
  RESIZE: `resize${EVENT_KEY}`,
  SCROLL: `scroll${EVENT_KEY}`
}

const Selector = {
  zoomImg: 'zoom-img'
}

/**
 *  图片缩放
 *  @author lyc
 *  @date 2020年9月5日15:52:12
 */
class Zoom {
  constructor(element) {
    this._element = element
    this.zoomTimer = null
    this.init()
    return this
  }

  static get NAME() {
    return NAME
  }

  static get VERSION() {
    return VERSION
  }

  static get element() {
    return element
  }

  static set element(ele) {
    element = ele
  }

  init() {
    let zoom = $(`#${Selector.zoomImg}`)
    if (zoom.length === 0) {
      zoom = $(`<div id="${Selector.zoomImg}"/>`).appendTo('body')
    }
    $(this._element).css({
      cursor: 'zoom-in'
    })
    $(this._element).on(Event.CLICK_ZOOM_IN, this.zoomIn())
    zoom.on(Event.CLICK_ZOOM_OUT, this.zoomOut())
  }

  zoomIn() {
    return () => {
      Zoom.element = this._element
      const $wrap = $('<div />')
      $wrap.css(Defaults.styles.zoomContainer)

      const $overlay = $('<div class="overlay" />')
      $overlay.css(Defaults.styles.overlay)
      const $img = $(`<img src="${this._element.src}"/>`)
      $img.css({
        cursor: 'default'
      })
      $img.css(Zoom.getImageStyle(this._element, false))

      const $btn = $('<a target="_blank" />')
      $btn.attr('href', $img.attr('src')).text('查看原图')
      $btn.css(Defaults.styles.btn)

      $btn.hover(function () {
        $(this).css(Defaults.styles.btnHover)
      }, function () {
        $(this).css(Defaults.styles.btn)
      })

      $wrap.append($overlay).append($img).append($btn)
      const zoom = $(`#${Selector.zoomImg}`)
      zoom.append($wrap)

      // transition
      $img.css(Zoom.getImageStyle($img.get(0), true))
    }
  }

  zoomOut() {
    return (event) => {
      // 点击的是图片retrun
      if (event.target.nodeName === 'IMG') {
        return
      }
      const $zoom = $(`#${Selector.zoomImg}`)
      $zoom.find('img').css(Zoom.getImageStyle(this._element, false))
      $zoom.find('.overlay').css({
        opacity: 0
      })

      if (this.zoomTimer) {
        clearTimeout(this.zoomTimer)
      }
      const n = 150
      this.zoomTimer = setTimeout(() => {
        $zoom.html('')
      }, n)
    }
  }

  static getImageStyle(image, isZoom) {
    const imageOffset = image.getBoundingClientRect()
    const top = imageOffset.top
    const left = imageOffset.left
    const width = image.width
    const height = image.height

    const style = {
      top,
      left,
      width,
      height
    }

    if (!isZoom) {
      return Object.assign({}, Defaults.styles.zoomImage, style)
    }

    style.width = image.naturalWidth
    style.height = image.naturalHeight
    const two = 2
    // Get the the coords for center of the viewport
    const viewportX = window.innerWidth / two
    const viewportY = window.innerHeight / two

    // Get the coords for center of the original image
    const imageCenterX = imageOffset.left + image.width / two
    const imageCenterY = imageOffset.top + image.height / two

    // Get offset amounts for image coords to be centered on screen
    const translateX = viewportX - imageCenterX
    const translateY = viewportY - imageCenterY

    // Figure out how much to scale the image so it doesn't overflow the screen
    const scale = Zoom.getScale(width, height)

    const zoomStyle = {
      transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`
    }

    return Object.assign({}, Defaults.styles.zoomImage, style, zoomStyle)
  }

  static getScale(width, height) {
    const totalMargin = 10
    const scaleX = window.innerWidth / (width + totalMargin)
    const scaleY = window.innerHeight / (height + totalMargin)
    return Math.min(scaleX, scaleY)
  }
}

export default Zoom
