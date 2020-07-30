import $ from 'jquery'
import Toast from './toast'
import Tool from './tool'

const NAME                = 'ajax'
const VERSION             = '1.0.0'
const POST                = 'post'
const GET                 = 'get'
const JSON                = 'json'
const HTML                = 'html'
const ONE_DAY             = 86400000
const APPLICATION_JSON = 'application/json;charset=utf-8'
const APPLICATION_X_WWW_FORM_URLENCODED = 'application/x-www-form-urlencoded;charset=utf-8'
const MULTIPART_FORM_DATA = 'multipart/form-data;charset=utf-8'

class Ajax {
  static get VERSION() {
    return VERSION
  }

  static get NAME() {
    return NAME
  }

  static get POST() {
    return POST
  }

  static get GET() {
    return GET
  }

  static get JSON() {
    return JSON
  }

  static get HTML() {
    return HTML
  }

  static get APPLICATION_JSON() {
    return APPLICATION_JSON
  }

  static get APPLICATION_X_WWW_FORM_URLENCODED() {
    return APPLICATION_X_WWW_FORM_URLENCODED
  }

  static get MULTIPART_FORM_DATA() {
    return MULTIPART_FORM_DATA
  }
  static post(url, data, suc, err) {
    const settings = {
      url,
      data: data || {},
      type: POST,
      success: suc,
      error: err,
      dataType: JSON
    }
    this.send(settings)
  }
  static get(url, data, suc, err) {
    const settings = {
      url,
      data: data || {},
      type: GET,
      success: suc,
      error: err,
      dataType: JSON
    }
    this.send(settings)
  }

  static postHTML(url, data, suc, err) {
    const settings = {
      url,
      data: data || {},
      type: POST,
      success: suc,
      error: err,
      dataType: HTML
    }
    this.send(settings)
  }

  static getHTML(url, data, suc, err) {
    const settings = {
      url,
      data: data || {},
      type: GET,
      success: suc,
      error: err,
      dataType: HTML
    }
    this.send(settings)
  }

  static postJSON(url, data, suc, err) {
    const settings = {
      url,
      data: data || {},
      type: POST,
      contentType : APPLICATION_JSON,
      success: suc,
      error: err,
      dataType: JSON
    }
    this.send(settings)
  }

  static getJSON(url, data, suc, err) {
    const settings = {
      url,
      data: data || {},
      type: GET,
      contentType : APPLICATION_JSON,
      success: suc,
      error: err,
      dataType: JSON
    }
    this.send(settings)
  }

  static postJSONHTML(url, data, suc, err) {
    const settings = {
      url,
      data: data || {},
      type: POST,
      contentType : APPLICATION_JSON,
      success: suc,
      error: err,
      dataType: HTML
    }
    this.send(settings)
  }

  static getJSONHTML(url, data, suc, err) {
    const settings = {
      url,
      data: data || {},
      type: GET,
      contentType : APPLICATION_JSON,
      success: suc,
      error: err,
      dataType: HTML
    }
    this.send(settings)
  }

  static send(op) {
    // 默认同步请求
    const settings = {
      type: POST,
      async : false,
      contentType: APPLICATION_X_WWW_FORM_URLENCODED,
      dataType: JSON,
      data: {},
      success : this.success,
      error : this.error(op.error)
    }
    if (op) {
      delete op.error
    }
    op = typeof op === 'object' && op ? op : {}
    const opData = typeof op.data === 'object' && op.data ? op.data : {}
    let nData
    if (opData instanceof Object) {
      nData = {}
      for (const key in opData) {
        if (!key.toString().includes('.')) {
          nData[key] = opData[key]
        }
      }
    } else {
      nData = opData
    }

    switch (op.contentType) {
      default:
      case APPLICATION_X_WWW_FORM_URLENCODED:
        nData = Tool.toSerialize(nData)
        break
      case MULTIPART_FORM_DATA:
        break
      case APPLICATION_JSON:
        nData = window.JSON.stringify(nData)
        break
    }
    op.data = nData
    op = {
      ...settings,
      ...op
    }
    $.ajax(op)
  }

  static success(result) {
    if (!result || typeof result !== 'object') {
      return Toast.err('未知错误')
    }
    return Toast.suc(result.message)
  }

  static error(callback) {
    return function (XMLHttpRequest) {
      let errMsg = '未知错误'
      if (XMLHttpRequest && XMLHttpRequest.responseText) {
        const responseText = XMLHttpRequest.responseText
        if (Tool.isJSON(responseText)) {
          errMsg = window.JSON.parse(responseText).message
        } else {
          errMsg = responseText
        }
      }
      if (callback && typeof callback === 'function') {
        callback(XMLHttpRequest)
      }
      return Toast.err(errMsg)
    }
  }

  static setCookie(key, value, exdays) {
    let expires = ''
    if (exdays) {
      const d = new Date()
      d.setTime(d.getTime() + exdays * ONE_DAY)// 有效期一天
      expires = `expires=${d.toUTCString()}`
    }
    document.cookie = `${key}=${value};${expires};path=/`
  }

  static getCookie(cname) {
    const name = `${cname}=`
    const decodedCookie = decodeURIComponent(document.cookie)
    const ca = decodedCookie.split(';')
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === ' ') {
        c = c.substring(1)
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length)
      }
    }
    return ''
  }
}

export default Ajax
