/*!
  * Bootstrap editor.js v4.3.1 (http://jiopeel.com/)
  * Copyright 2011-2020 lyc
  */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('./ajax.js')) :
  typeof define === 'function' && define.amd ? define(['./ajax.js'], factory) :
  (global = global || self, global.Editor = factory(global.Ajax));
}(this, function (Ajax) { 'use strict';

  Ajax = Ajax && Ajax.hasOwnProperty('default') ? Ajax['default'] : Ajax;

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  var NAME = 'edior';
  var VERSION = '21.0.0';
  var UPLOAD_URL = 'http://127.0.0.1/file/upload';
  var FILENAME = 'file';

  var Editor =
  /*#__PURE__*/
  function () {
    function Editor(element) {
      this._element = null;
      this.editor = null;
      this.init(element);
      return this;
    }

    Editor.MyCustomUploadAdapterPlugin = function MyCustomUploadAdapterPlugin(editor) {
      editor.plugins.get('FileRepository').createUploadAdapter = function (loader) {
        return (// Configure the URL to the upload script in your back-end here!
          new EditorPlugin(loader)
        );
      };
    };

    var _proto = Editor.prototype;

    _proto.init = function init(selector) {
      var _this = this;

      // eslint-disable-next-line no-undef
      if (!ClassicEditor) {
        throw new ReferenceError("CKEditor 5  is not load! need version:" + VERSION + ", plz chk out");
      }

      this._element = typeof selector === 'string' ? document.querySelector(selector) : selector; // eslint-disable-next-line no-undef

      return ClassicEditor.create(this._element, {
        extraPlugins: [Editor.MyCustomUploadAdapterPlugin],
        language: 'zh-cn',
        toolbar: {
          viewportTopOffset: this.getViewportTopOffsetConfig()
        }
      }).then(function (editor) {
        _this.editor = editor; // Save for later use.
        // 赋值

        if (_this._element.value) {
          _this.setData(_this._element.value);
        }

        editor.model.document.on('change:data', function () {
          _this.setItem(_this.getData());
        });
      }).catch(function (error) {
        // eslint-disable-next-line no-console
        console.log(error);
      });
    };

    _proto.getViewportTopOffsetConfig = function getViewportTopOffsetConfig() {
      var documentElement = document.documentElement; // eslint-disable-next-line radix

      return parseInt(window.getComputedStyle(documentElement).getPropertyValue('--ck-viewport-top-offset'));
    };

    _proto.getData = function getData() {
      return this.editor.getData();
    };

    _proto.setData = function setData(html) {
      this.editor.setData(html);
    };

    _proto.setItem = function setItem(html) {
      this._element.value = html;
    };

    _createClass(Editor, null, [{
      key: "NAME",
      get: function get() {
        return NAME;
      }
    }, {
      key: "VERSION",
      get: function get() {
        return "CKEditor 5 version : " + VERSION;
      }
    }]);

    return Editor;
  }();

  var EditorPlugin =
  /*#__PURE__*/
  function () {
    function EditorPlugin(loader) {
      // The file loader instance to use during the upload.
      this.loader = loader;
      this.uploadUrl = UPLOAD_URL;
    }

    var _proto2 = EditorPlugin.prototype;

    _proto2.upload = function upload() {
      var _this2 = this;

      return this.loader.file.then(function (file) {
        return new Promise(function (resolve, reject) {
          _this2._initRequest();

          _this2._initListeners(resolve, reject, file);

          _this2._sendRequest(file);
        });
      });
    } // Aborts the upload process.
    ;

    _proto2.abort = function abort() {
      if (this.xhr) {
        this.xhr.abort();
      }
    } // Initializes the XMLHttpRequest object using the URL passed to the constructor.
    ;

    _proto2._initRequest = function _initRequest() {
      this.xhr = new XMLHttpRequest();
      var xhr = this.xhr; // Note that your request may look different. It is up to you and your editor
      // integration to choose the right communication channel. This example uses
      // a POST request with JSON as a data structure but your configuration
      // could be different.

      xhr.open(Ajax.POST, this.uploadUrl, true);
      xhr.responseType = Ajax.JSON;
    } // Initializes XMLHttpRequest listeners.
    ;

    _proto2._initListeners = function _initListeners(resolve, reject, file) {
      var xhr = this.xhr;
      var loader = this.loader;
      var genericErrorText = "Couldn't upload file: " + file.name + ".";
      xhr.addEventListener('error', function () {
        return reject(genericErrorText);
      });
      xhr.addEventListener('abort', function () {
        return reject();
      });
      xhr.addEventListener('load', function () {
        var response = xhr.response; // This example assumes the XHR server's "response" object will come with
        // an "error" which has its own "message" that can be passed to reject()
        // in the upload promise.
        //
        // Your integration may handle upload errors in a different way so make sure
        // it is done properly. The reject() function must be called when the upload fails.

        if (!response || response.error) {
          return reject(response && response.error ? response.error.message : genericErrorText);
        } // 成功回调处理


        var data = response.data; // If the upload is successful, resolve the upload promise with an object containing
        // at least the "default" URL, pointing to the image on the server.
        // This URL will be used to display the image in the content. Learn more in the
        // UploadAdapter#upload documentation.

        return resolve({
          default: data.url
        });
      }); // Upload progress when it is supported. The file loader has the #uploadTotal and #uploaded
      // properties which are used e.g. to display the upload progress bar in the editor
      // user interface.

      if (xhr.upload) {
        xhr.upload.addEventListener('progress', function (evt) {
          if (evt.lengthComputable) {
            loader.uploadTotal = evt.total;
            loader.uploaded = evt.loaded;
          }
        });
      }
    } // Prepares the data and sends the request.
    ;

    _proto2._sendRequest = function _sendRequest(file) {
      // Prepare the form data.
      var data = new FormData();
      data.append(FILENAME, file); // Important note: This is the right place to implement security mechanisms
      // like authentication and CSRF protection. For instance, you can use
      // XMLHttpRequest.setRequestHeader() to set the request headers containing
      // the CSRF token generated earlier by your application.
      // Send the request.

      this.xhr.send(data);
    };

    _createClass(EditorPlugin, null, [{
      key: "NAME",
      get: function get() {
        return NAME;
      }
    }, {
      key: "VERSION",
      get: function get() {
        return "CKEditor 5 version : " + VERSION;
      }
    }]);

    return EditorPlugin;
  }();

  return Editor;

}));
//# sourceMappingURL=editor.js.map
