/* eslint-disable no-console */
/* eslint-disable camelcase */
import Toast from './toast'
import Tool from './tool'
import Util from './util'

const NAME                = 'upload'
const VERSION             = '1.0.0'
const URL                 = 'http://127.0.0.1/file/upload'
const URL_MULTI           = 'http://127.0.0.1/file/uploads'

/**
 *  @author lyc
 *  @date 2020年08月23日16:15:25
 */
class Upload {
  constructor(element) {
    this._element = element
    this._upload = this._init()
  }

  static get NAME() {
    return NAME
  }

  static get VERSION() {
    return VERSION
  }

  _init() {
    // eslint-disable-next-line no-undef
    if (!plupload) {
      throw new TypeError('plupload is not load, plz check out')
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
    // eslint-disable-next-line no-undef
    const loader = new plupload.Uploader({ // 实例化一个plupload上传对象
      runtimes: 'html5,html4,flash,silverlight',
      browse_button: ele,
      url: URL,
      filters: {
        max_file_size: '10mb',
        mime_types: [
          {
            title: 'Image files',
            extensions: 'jpg,gif,png,svg'
          },
          {
            title: 'Zip files',
            extensions: 'zip'
          }
        ]
      }
    })
    const suc = Tool.eval(ele.getAttribute('data-suc'))
    if (typeof suc === 'function') {
      loader._suc = suc
    }
    const chk = Tool.eval(ele.getAttribute('data-chk'))
    if (typeof chk === 'function') {
      loader._chk = chk
    }
    // 用户选择文件时触发
    loader.bind('FilesAdded', this.fileAdded)
    // 文件上传成功的时候触发
    loader.bind('FileUploaded', this.fileSuc)
    // 上传出错的时候触发
    loader.bind('Error', () => {
      Toast.err('文件上传失败')
    })
    loader.init()
    return loader
  }

  fileAdded(uploader, files) {
    // 检查失败
    if (uploader._chk && typeof uploader._chk === 'function' && !uploader._chk(files)) {
      for (const file in files) {
        if (!Object.prototype.hasOwnProperty.call(files, file)) {
          continue
        }
        uploader.removeFile(file)
      }
      return
    }
    // 当选择的文件大于1 时候更改上传url
    uploader.setOption('url', files.length > 1 ? URL_MULTI : URL)
    uploader.start() // 开始上传
  }

  fileSuc(uploader, _file, responseObject) {
    let fr
    const datas = JSON.parse(responseObject.response)
    if (datas && datas.data) {
      fr = datas.data
    }
    if (uploader._suc && typeof uploader._suc === 'function') {
      uploader._suc(fr)
    }
  }
}

export default Upload
