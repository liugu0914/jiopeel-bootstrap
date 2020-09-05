/*!
  * Bootstrap upload.js v4.3.1 (http://jiopeel.com/)
  * Copyright 2011-2020 lyc
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
  var METHOD = 'post';
  var FILENAME = 'file';
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
      return this;
    }

    var _proto = Upload.prototype;

    _proto._init = function _init() {
      // eslint-disable-next-line no-undef
      if (!Dropzone) {
        throw new TypeError('Dropzone is not load, plz check out');
      } // 上传图片


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
      // 使用 https://www.dropzonejs.com/
      // eslint-disable-next-line no-undef
      Dropzone.options.myAwesomeDropzone = false; // eslint-disable-next-line no-undef

      Dropzone.autoDiscover = false;
      var Multiple = ele.hasAttribute('multiple');
      var Accept = ele.getAttribute('accept') || 'image/*,.jpg,.gif,.png,.svg,';
      var url = Multiple ? URL_MULTI : URL; // 多选时 指定最大文件数为9 否则为1

      var nine = 9;
      var maxFiles = Multiple ? nine : 1;
      var options = {
        // 实例化一个Dropzone上传对象
        url: url,
        acceptedFiles: Accept,
        // 上传的类型
        uploadMultiple: Multiple,
        // 是否允许多文件上传
        method: METHOD,
        // 默认post
        paramName: FILENAME,
        // 默认为file
        maxFiles: maxFiles,
        // 一次性上传的文件数量上限
        maxFilesize: 20,
        // MB
        timeout: 10000,
        // 以毫秒为单位
        parallelUploads: 3,
        // 并行处理多少个文件上载
        createImageThumbnails: false,
        // 是否应生成图像的缩略图
        dictMaxFilesExceeded: '您最多只能上传10个文件！',
        dictResponseError: '文件上传失败!',
        dictInvalidFileType: '你不能上传该类型文件,文件类型只能是*.jpg,*.gif,*.png。',
        dictFallbackMessage: '浏览器不受支持',
        dictFileTooBig: '文件过大上传文件最大支持.' // eslint-disable-next-line no-undef

      };
      var dropzone = new Dropzone(ele, options);
      var suc = Tool.eval(ele.getAttribute('data-suc'));

      if (typeof suc === 'function') {
        this._suc = suc;
      }

      var chk = Tool.eval(ele.getAttribute('data-chk'));

      if (typeof chk === 'function') {
        this._chk = chk;
      } // 将文件添加到列表时


      dropzone.on('addedfile', this.fileAdded(this)); // 文件上传成功的时候触发

      dropzone.on('success', this.fileSuc(this)); // 上传出错的时候触发

      dropzone.on('error', function () {
        Toast.err('文件上传失败');
      });
      return dropzone;
    };

    _proto.fileAdded = function fileAdded(uploader) {
      return function (files) {
        var preview = uploader._element.querySelector('.dz-preview');

        if (preview) {
          preview.remove();
        }

        var flag = true; // 检查失败

        if (uploader._chk && typeof uploader._chk === 'function' && !uploader._chk(files)) {
          flag = false;
        }

        return flag;
      };
    };

    _proto.fileSuc = function fileSuc(uploader) {
      return function (files, response) {
        var fr;

        if (!Tool.isJSON(response)) {
          Toast.err('文件上传失败');
          return;
        }

        if (response.data) {
          fr = response.data;
        }

        if (uploader._suc && typeof uploader._suc === 'function') {
          uploader._suc(fr, uploader._element);
        }
      };
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
