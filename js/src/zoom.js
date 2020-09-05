import $ from 'jquery'

const NAME = 'zoom'
const VERSION = '1.0.0'

/**
 *  图片缩放
 *  @author lyc
 *  @date 2020年08月23日16:15:25
 */
class Zoom {
  constructor(element) {
    this._element = element
    this._upload = this._init()
    return this
  }

  static get NAME() {
    return NAME
  }

  static get VERSION() {
    return VERSION
  }
}

export default Zoom
