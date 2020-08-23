import Ajax from './ajax'

const NAME                = 'edior'
const VERSION             = '21.0.0'
const UPLOAD_URL          = 'http://127.0.0.1/file/upload'
const FILENAME            = 'file'

class Editor {
  constructor(loader) {
    // The file loader instance to use during the upload.
    this.loader = loader
    this.uploadUrl = UPLOAD_URL
  }

  static get NAME() {
    return NAME
  }

  static get VERSION() {
    return `CKEditor 5 version : ${VERSION}`
  }

  upload() {
    return this.loader.file
      .then((file) => new Promise((resolve, reject) => {
        this._initRequest()
        this._initListeners(resolve, reject, file)
        this._sendRequest(file)
      }))
  }

  // Aborts the upload process.
  abort() {
    if (this.xhr) {
      this.xhr.abort()
    }
  }

  // Initializes the XMLHttpRequest object using the URL passed to the constructor.
  _initRequest() {
    this.xhr = new XMLHttpRequest()
    const xhr = this.xhr
    // Note that your request may look different. It is up to you and your editor
    // integration to choose the right communication channel. This example uses
    // a POST request with JSON as a data structure but your configuration
    // could be different.
    xhr.open(Ajax.POST, this.uploadUrl, true)
    xhr.responseType = Ajax.JSON
  }

  // Initializes XMLHttpRequest listeners.
  _initListeners(resolve, reject, file) {
    const xhr = this.xhr
    const loader = this.loader
    const genericErrorText = `Couldn't upload file: ${file.name}.`

    xhr.addEventListener('error', () => reject(genericErrorText))
    xhr.addEventListener('abort', () => reject())
    xhr.addEventListener('load', () => {
      const response = xhr.response
      // This example assumes the XHR server's "response" object will come with
      // an "error" which has its own "message" that can be passed to reject()
      // in the upload promise.
      //
      // Your integration may handle upload errors in a different way so make sure
      // it is done properly. The reject() function must be called when the upload fails.
      if (!response || response.error) {
        return reject(response && response.error ? response.error.message : genericErrorText)
      }
      // 成功回调处理
      const data = response.data
      // If the upload is successful, resolve the upload promise with an object containing
      // at least the "default" URL, pointing to the image on the server.
      // This URL will be used to display the image in the content. Learn more in the
      // UploadAdapter#upload documentation.
      return resolve({
        default: data.url
      })
    })

    // Upload progress when it is supported. The file loader has the #uploadTotal and #uploaded
    // properties which are used e.g. to display the upload progress bar in the editor
    // user interface.
    if (xhr.upload) {
      xhr.upload.addEventListener('progress', (evt) => {
        if (evt.lengthComputable) {
          loader.uploadTotal = evt.total
          loader.uploaded = evt.loaded
        }
      })
    }
  }

  // Prepares the data and sends the request.
  _sendRequest(file) {
    // Prepare the form data.
    const data = new FormData()

    data.append(FILENAME, file)

    // Important note: This is the right place to implement security mechanisms
    // like authentication and CSRF protection. For instance, you can use
    // XMLHttpRequest.setRequestHeader() to set the request headers containing
    // the CSRF token generated earlier by your application.

    // Send the request.
    this.xhr.send(data)
  }

  static MyCustomUploadAdapterPlugin(editor) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) =>
    // Configure the URL to the upload script in your back-end here!
      new Editor(loader)
  }

  static init(selector) {
    // eslint-disable-next-line no-undef
    if (!ClassicEditor) {
      throw new ReferenceError(`CKEditor 5  is not load! need version:${VERSION}, plz chk out`)
    }
    const target = typeof selector === 'string' ? document.querySelector(selector) : selector
    // eslint-disable-next-line no-undef
    return ClassicEditor
      .create(target, {
        extraPlugins: [Editor.MyCustomUploadAdapterPlugin],
        language: 'zh-cn'
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.log(error)
      })
  }
}

export default Editor
