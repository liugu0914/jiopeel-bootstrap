/*!
  * Bootstrap upload.js v4.3.1 (https://getbootstrap.com/)
  * Copyright 2011-2020 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
  * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
  */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('./toast.js'), require('./tool.js'), require('./util.js')) :
  typeof define === 'function' && define.amd ? define(['./toast.js', './tool.js', './util.js'], factory) :
  (global = global || self, global.Upload = factory(global.Toast, global.Tool, global.Util));
}(this, function (Toast, Tool, Util) { 'use strict';

  Toast = Toast && Toast.hasOwnProperty('default') ? Toast['default'] : Toast;
  Tool = Tool && Tool.hasOwnProperty('default') ? Tool['default'] : Tool;
  Util = Util && Util.hasOwnProperty('default') ? Util['default'] : Util;

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

  var NAME = 'upload';
  var VERSION = '1.0.0';
  var URL = 'http://127.0.0.1/file/upload';
  var URL_MULTI = 'http://127.0.0.1/file/uploads';
  /**
   *  @author lyc
   *  @date 2020年08月23日16:15:25
   */

  var Upload =
  /*#__PURE__*/
  function () {
    function Upload(element) {
      this._element = element;
      this._upload = this._init();
    }

    var _proto = Upload.prototype;

    _proto._init = function _init() {
      // 上传图片
      var ele = this._element;

      if (!ele) {
        return;
      }

      if (Array.isArray(ele)) {
        for (var key in ele) {
          if (!Object.prototype.hasOwnProperty.call(ele, key)) {
            continue;
          }

          var item = key;

          if (!Util.isElement(item)) {
            item = document.querySelector(item);
          }

          item.id = item.id ? item.id : "upload_" + new Date().getTime();
          this.uploadinit(item);
        }

        return;
      } else if (typeof ele === 'string') {
        ele = document.querySelector(ele);
      }

      if (Util.isElement(ele)) {
        ele.id = ele.id ? ele.id : "upload_" + new Date().getTime();
        this.uploadinit(ele);
      }
    };

    _proto.uploadinit = function uploadinit(ele) {
      // eslint-disable-next-line no-undef
      var loader = new plupload.Uploader({
        // 实例化一个plupload上传对象
        runtimes: 'html5,html4,flash,silverlight',
        // eslint-disable-next-line camelcase
        browse_button: ele,
        url: URL,
        filters: {
          max_file_size: '10mb',
          mime_types: [{
            title: 'Image files',
            extensions: 'jpg,gif,png,svg'
          }, {
            title: 'Zip files',
            extensions: 'zip'
          }]
        }
      });
      var suc = Tool.eval(ele.getAttribute('data-suc'));

      if (typeof suc === 'function') {
        loader._suc = suc;
      }

      var chk = Tool.eval(ele.getAttribute('data-chk'));

      if (typeof chk === 'function') {
        loader._chk = chk;
      } // 用户选择文件时触发


      loader.bind('FilesAdded', this.fileAdded); // 文件上传成功的时候触发

      loader.bind('FileUploaded', this.fileSuc); // 上传出错的时候触发

      loader.bind('Error', function () {
        Toast.err('文件上传失败');
      });
      loader.init();
      return loader;
    };

    _proto.fileAdded = function fileAdded(uploader, files) {
      // 检查失败
      if (uploader._chk && typeof uploader._chk === 'function' && !uploader._chk(files)) {
        for (var file in files) {
          if (!Object.prototype.hasOwnProperty.call(files, file)) {
            continue;
          }

          uploader.removeFile(file);
        }

        return;
      } // 当选择的文件大于1 时候更改上传url


      uploader.setOption('url', files.length > 1 ? URL_MULTI : URL);
      uploader.start(); // 开始上传
    };

    _proto.fileSuc = function fileSuc(uploader, _file, responseObject) {
      var fr;
      var datas = JSON.parse(responseObject.response);

      if (datas && datas.data) {
        fr = datas.data;
      }

      if (uploader._suc && typeof uploader._suc === 'function') {
        uploader._suc(fr);
      }
    };

    _createClass(Upload, null, [{
      key: "NAME",
      get: function get() {
        return NAME;
      }
    }, {
      key: "VERSION",
      get: function get() {
        return VERSION;
      }
    }]);

    return Upload;
  }();

  return Upload;

}));
//# sourceMappingURL=upload.js.map
