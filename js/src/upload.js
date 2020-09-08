/* eslint-disable no-console */
/* eslint-disable camelcase */
import Toast from './toast'
import Tool from './tool'
import Util from './util'

const NAME = 'upload'
const METHOD = 'post'
const FILENAME = 'file'
const VERSION = '1.0.0'
const URL = 'http://127.0.0.1/file/upload'
const URL_MULTI = 'http://127.0.0.1/file/uploads'

/**
 *  @author lyc
 *  @date 2020年08月23日16:15:25
 */
class Upload {
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

  _init() {
    // eslint-disable-next-line no-undef
    if (!Dropzone) {
      throw new TypeError('Dropzone is not load, plz check out')
    }
    // 上传图片
    let ele = this._element
    if (!ele) {
      return
    }
    if (Array.isArray(ele)) {
      for (const key in ele) {
        if (!Object.prototype.hasOwnProperty.call(ele, key)) {
          continue
        }
        let item = key
        if (!Util.isElement(item)) {
          item = document.querySelector(item)
        }
        item.id = item.id ? item.id : `upload_${new Date().getTime()}`
        this.uploadinit(item)
      }
      return
    } else if (typeof ele === 'string') {
      ele = document.querySelector(ele)
    }
    if (Util.isElement(ele)) {
      ele.id = ele.id ? ele.id : `upload_${new Date().getTime()}`
      this.uploadinit(ele)
    }
  }

  uploadinit(ele) {
    // 使用 https://www.dropzonejs.com/
    // eslint-disable-next-line no-undef
    Dropzone.options.myAwesomeDropzone = false
    // eslint-disable-next-line no-undef
    Dropzone.autoDiscover = false

    const Multiple = ele.hasAttribute('multiple')
    const Accept = ele.getAttribute('accept') || 'image/*,.jpg,.gif,.png,.svg,'
    const url = Multiple ? URL_MULTI : URL
    // 多选时 指定最大文件数为9 否则为1
    const nine = 9
    const maxFiles = Multiple ? nine : 1
    const options = { // 实例化一个Dropzone上传对象
      url,
      acceptedFiles: Accept, // 上传的类型
      uploadMultiple: Multiple, // 是否允许多文件上传
      method: METHOD,  // 默认post
      paramName: FILENAME, // 默认为file
      maxFiles, // 一次性上传的文件数量上限
      maxFilesize: 20, // MB
      timeout: 10000, // 以毫秒为单位
      parallelUploads: 3, // 并行处理多少个文件上载
      createImageThumbnails: false, // 是否应生成图像的缩略图
      dictMaxFilesExceeded: `您最多只能上传${maxFiles}个文件！`,
      dictResponseError: '文件上传失败!',
      dictInvalidFileType: `你不能上传该类型文件,文件类型只能是${Accept}`,
      dictFallbackMessage: '浏览器不受支持',
      dictFileTooBig: '文件过大上传文件最大支持.'
    }
    // eslint-disable-next-line no-undef
    const dropzone = new Dropzone(ele, options)
    const suc = Tool.eval(ele.getAttribute('data-suc'))
    if (typeof suc === 'function') {
      this._suc = suc
    }
    const chk = Tool.eval(ele.getAttribute('data-chk'))
    if (typeof chk === 'function') {
      this._chk = chk
    }

    // 将文件添加到列表时
    dropzone.on('addedfile', this.fileAdded(this))
    // 文件上传成功的时候触发
    dropzone.on('success', this.fileSuc(this))
    // 上传出错的时候触发
    dropzone.on('error', (file, errorMessage) => {
      Toast.err(errorMessage)
    })
    // 上传完成直接清除放置区所有文件
    dropzone.on('complete', (file) => {
      dropzone.removeFile(file)
    })
    return dropzone
  }

  fileAdded(uploader) {
    return (files) => {
      const preview = uploader._element.querySelector('.dz-preview')
      if (preview) {
        preview.remove()
      }
      let flag = true
      // 检查失败
      if (uploader._chk && typeof uploader._chk === 'function' && !uploader._chk(files)) {
        flag = false
      }
      return flag
    }
  }

  fileSuc(uploader) {
    return (files, response) => {
      let fr
      if (!Tool.isJSON(response)) {
        Toast.err('文件上传失败')
        return
      }
      if (response.data) {
        fr = response.data
      }
      uploader._element.classList.add('dz-hasImg')
      if (uploader._suc && typeof uploader._suc === 'function') {
        uploader._suc(fr, uploader._element)
      }
    }
  }
}

export default Upload
