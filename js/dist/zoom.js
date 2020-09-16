/*!
  * Bootstrap zoom.js v4.3.1 (http://jiopeel.com/)
  * Copyright 2011-2020 lyc
  */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('jquery')) :
  typeof define === 'function' && define.amd ? define(['jquery'], factory) :
  (global = global || self, global.Zoom = factory(global.jQuery));
}(this, function ($) { 'use strict';

  $ = $ && $.hasOwnProperty('default') ? $['default'] : $;

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

  var NAME = 'zoom';
  var VERSION = '1.0.0';
  var DATA_KEY = 'lyc.zoom';
  var EVENT_KEY = "." + DATA_KEY;
  var element = null;
  var Defaults = {
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
  };
  var Event = {
    CLICK_ZOOM_IN: "click.in" + EVENT_KEY,
    CLICK_ZOOM_OUT: "click.out" + EVENT_KEY,
    RESIZE: "resize" + EVENT_KEY,
    SCROLL: "scroll" + EVENT_KEY
  };
  var Selector = {
    zoomImg: 'zoom-img',
    modalOpen: 'modal-open'
    /**
     *  图片缩放
     *  @author lyc
     *  @date 2020年9月5日15:52:12
     */

  };

  var Zoom =
  /*#__PURE__*/
  function () {
    function Zoom(element) {
      this._element = element;
      this.zoomTimer = null;
      this.init();
      return this;
    }

    var _proto = Zoom.prototype;

    _proto.init = function init() {
      var zoom = $("#" + Selector.zoomImg);

      if (zoom.length === 0) {
        zoom = $("<div id=\"" + Selector.zoomImg + "\"/>").appendTo('body');
      }

      $(this._element).css({
        cursor: 'zoom-in'
      });
      $(this._element).on(Event.CLICK_ZOOM_IN, this.zoomIn());
      zoom.on(Event.CLICK_ZOOM_OUT, this.zoomOut());
    };

    _proto.zoomIn = function zoomIn() {
      var _this = this;

      return function () {
        Zoom.element = _this._element;
        var $wrap = $('<div />');
        $wrap.css(Defaults.styles.zoomContainer);
        var $overlay = $('<div class="overlay" />');
        $overlay.css(Defaults.styles.overlay);
        var $img = $("<img src=\"" + _this._element.src + "\"/>");
        $img.css({
          cursor: 'default'
        });
        $img.css(Zoom.getImageStyle(_this._element, false));
        var $btn = $('<a target="_blank" />');
        $btn.attr('href', $img.attr('src')).text('查看原图');
        $btn.css(Defaults.styles.btn);
        $btn.hover(function () {
          $(this).css(Defaults.styles.btnHover);
        }, function () {
          $(this).css(Defaults.styles.btn);
        });
        $wrap.append($overlay).append($img).append($btn);
        var zoom = $("#" + Selector.zoomImg);
        zoom.append($wrap); // transition

        $img.css(Zoom.getImageStyle($img.get(0), true));
        $('body').addClass(Selector.modalOpen);
      };
    };

    _proto.zoomOut = function zoomOut() {
      var _this2 = this;

      return function (event) {
        // 点击的是图片retrun
        if (event.target.nodeName === 'IMG') {
          return;
        }

        var $zoom = $("#" + Selector.zoomImg);
        $zoom.find('img').css(Zoom.getImageStyle(_this2._element, false));
        $zoom.find('.overlay').css({
          opacity: 0
        });

        if (_this2.zoomTimer) {
          clearTimeout(_this2.zoomTimer);
        }

        var n = 150;
        _this2.zoomTimer = setTimeout(function () {
          $zoom.html('');
        }, n);

        if ($('body').hasClass(Selector.modalOpen)) {
          $('body').removeClass(Selector.modalOpen);
        }
      };
    };

    Zoom.getImageStyle = function getImageStyle(image, isZoom) {
      var imageOffset = image.getBoundingClientRect();
      var top = imageOffset.top;
      var left = imageOffset.left;
      var width = image.width;
      var height = image.height;
      var style = {
        top: top,
        left: left,
        width: width,
        height: height
      };

      if (!isZoom) {
        return Object.assign({}, Defaults.styles.zoomImage, style);
      }

      style.width = image.naturalWidth;
      style.height = image.naturalHeight;
      var two = 2; // Get the the coords for center of the viewport

      var viewportX = window.innerWidth / two;
      var viewportY = window.innerHeight / two; // Get the coords for center of the original image

      var imageCenterX = imageOffset.left + image.width / two;
      var imageCenterY = imageOffset.top + image.height / two; // Get offset amounts for image coords to be centered on screen

      var translateX = viewportX - imageCenterX;
      var translateY = viewportY - imageCenterY; // Figure out how much to scale the image so it doesn't overflow the screen

      var scale = Zoom.getScale(width, height);
      var zoomStyle = {
        transform: "translate3d(" + translateX + "px, " + translateY + "px, 0) scale(" + scale + ")"
      };
      return Object.assign({}, Defaults.styles.zoomImage, style, zoomStyle);
    };

    Zoom.getScale = function getScale(width, height) {
      var totalMargin = 10;
      var scaleX = window.innerWidth / (width + totalMargin);
      var scaleY = window.innerHeight / (height + totalMargin);
      return Math.min(scaleX, scaleY);
    };

    _createClass(Zoom, null, [{
      key: "NAME",
      get: function get() {
        return NAME;
      }
    }, {
      key: "VERSION",
      get: function get() {
        return VERSION;
      }
    }, {
      key: "element",
      get: function get() {
        return element;
      },
      set: function set(ele) {
        element = ele;
      }
    }]);

    return Zoom;
  }();

  return Zoom;

}));
//# sourceMappingURL=zoom.js.map
