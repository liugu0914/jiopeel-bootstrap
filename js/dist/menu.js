/*!
  * Bootstrap menu.js v4.3.1 (https://getbootstrap.com/)
  * Copyright 2011-2020 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
  * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
  */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('jquery'), require('./ajax.js')) :
  typeof define === 'function' && define.amd ? define(['jquery', './ajax.js'], factory) :
  (global = global || self, global.Menu = factory(global.jQuery, global.Ajax));
}(this, function ($, Ajax) { 'use strict';

  $ = $ && $.hasOwnProperty('default') ? $['default'] : $;
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

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      var ownKeys = Object.keys(source);

      if (typeof Object.getOwnPropertySymbols === 'function') {
        ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        }));
      }

      ownKeys.forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    }

    return target;
  }

  var NAME = 'menu';
  var DATA_KEY = 'lyc.menu';
  var EVENT_KEY = "." + DATA_KEY;
  var DATA_API_KEY = '.data-api';
  var JQUERY_NO_CONFLICT = $.fn[NAME];
  var Event = {
    CLICK_DATA_API: "click" + EVENT_KEY + DATA_API_KEY,
    CLICK_CLOSE_DATA_API: "click.close" + EVENT_KEY + DATA_API_KEY
  };
  var Customer = {
    MENUID: 'menuid',
    URL: 'url',
    NAME: 'name',
    ICON: 'icon',
    CLOSE: 'close',
    SHOW: 'show'
  };
  var HTML_CONTEXT = {
    HEADER: "<a class=\"home-page\" href=\"#\" \n            data-" + Customer.URL + "=\"{{" + Customer.URL + "}}\"\n            data-" + Customer.MENUID + "=\"{{" + Customer.MENUID + "}}\">\n            {{" + Customer.ICON + "}} {{" + Customer.NAME + "}} \n            {{" + Customer.CLOSE + "}}\n            </a>",
    BODY: "<div class=\"iframe-content\" data-" + Customer.MENUID + "=\"{{" + Customer.MENUID + "}}\"></div>",
    CLOSE: '<i class="cs cs-guanbi"></i>'
  };
  var Selector = {
    MENU_HEADER: '#menu-list',
    MENU_BODY: '#page-content',
    ACTIVE: 'active',
    LEFT_MENU: '.metismenu',
    CLOSE: '.cs.cs-guanbi'
    /**
     * ------------------------------------------------------------------------
     *  菜单生产
     *  @author lyc
     *  @date 2020年06月04日17:48:50
     * ------------------------------------------------------------------------
     */

  };

  var Menu =
  /*#__PURE__*/
  function () {
    function Menu(element) {
      this._element = element;
      this.init();
      return this;
    }

    var _proto = Menu.prototype;

    // ----------------------------------------------------------------------
    // 初始化
    // ----------------------------------------------------------------------
    _proto.init = function init() {
      var data = $(this._element).data();
      var $header = $(Selector.MENU_HEADER);
      var $body = $(Selector.MENU_BODY);

      if ($header.length === 0 || $body.length === 0 || !data[Customer.URL]) {
        return;
      }

      var select = "[data-" + Customer.MENUID + " = " + data[Customer.MENUID] + "]";
      var $a = $header.find(select);

      if ($a.length === 0) {
        // 生产头部
        var headerDiv = HTML_CONTEXT.HEADER;
        headerDiv = headerDiv.replace(new RegExp("{{" + Customer.URL + "}}", 'g'), data[Customer.URL]);
        headerDiv = headerDiv.replace(new RegExp("{{" + Customer.MENUID + "}}", 'g'), data[Customer.MENUID]);
        headerDiv = headerDiv.replace(new RegExp("{{" + Customer.CLOSE + "}}", 'g'), data[Customer.CLOSE] === false ? '' : HTML_CONTEXT.CLOSE);
        headerDiv = headerDiv.replace(new RegExp("{{" + Customer.ICON + "}}", 'g'), data[Customer.ICON] ? "<i class =\"" + data[Customer.ICON] + "\"></i>" : '');
        headerDiv = headerDiv.replace(new RegExp("{{" + Customer.NAME + "}}", 'g'), data[Customer.NAME]);
        $a = $(headerDiv).appendTo($header);
      }

      var $b = $body.find(select);

      if ($b.find(select).length === 0) {
        // 生产身体
        var bodyDiv = HTML_CONTEXT.BODY;
        bodyDiv = bodyDiv.replace(new RegExp("{{" + Customer.MENUID + "}}", 'g'), data[Customer.MENUID]);
        $b = $(bodyDiv).appendTo($body);
        $b.data(_objectSpread({}, $b.data(), data));
      }

      $a.on(Event.CLICK_DATA_API, this.click); // 直接触发

      $a.trigger($.Event(Event.CLICK_DATA_API)); // 关闭标签 的初始化

      $a.find(Selector.CLOSE).on(Event.CLICK_CLOSE_DATA_API, this.closeLable);
    } // ----------------------------------------------------------------------
    // i标签关闭功能触发
    // ----------------------------------------------------------------------
    ;

    _proto.closeLable = function closeLable(event) {
      if (event) {
        event.preventDefault();
      } // 1头部操作


      var $this = $(event.target);
      var $a = $this.closest('a');
      var data = $a.data();
      Menu.close(data[Customer.MENUID]);
    } // ----------------------------------------------------------------------
    // a标签点击功能触发
    // ----------------------------------------------------------------------
    ;

    _proto.click = function click(event) {
      if (event) {
        event.preventDefault();
      }

      var $this = $(event.currentTarget);
      var data = $this.data();
      Menu.open(data[Customer.MENUID]);
    } // ----------------------------------------------------------------------
    // 通过menuid关闭菜单
    // ----------------------------------------------------------------------
    ;

    Menu.close = function close(menuId) {
      if (!menuId) {
        var $header = $(Selector.MENU_HEADER);

        var _$a = $header.find("a." + Selector.ACTIVE);

        menuId = _$a.data(Customer.MENUID);
      } // 1头部操作


      var select = "[data-" + Customer.MENUID + " = " + menuId + "]";
      var $a = $(Selector.MENU_HEADER).find(select); // 关闭之后默认获取最近的一个
      // eslint-disable-next-line no-nested-ternary

      var $round = $a.prev().length !== 0 ? $a.prev() : $a.next().length !== 0 ? $a.next() : null;
      var $preva = $a.hasClass(Selector.ACTIVE) ? $round : null;
      var $body = $(Selector.MENU_BODY).find(select).eq(0); // 关闭自身

      $a.remove();
      $body.remove();

      if ($preva && $preva.length !== 0) {
        $preva.addClass(Selector.ACTIVE);
        var prevSelect = "[data-" + Customer.MENUID + " = " + $preva.data(Customer.MENUID) + "]";
        var $prevbody = $(Selector.MENU_BODY).find(prevSelect).eq(0);
        $prevbody.addClass(Selector.ACTIVE);
      }
    } // ----------------------------------------------------------------------
    // 通过menuid关闭其他菜单
    // ----------------------------------------------------------------------
    ;

    Menu.closeOther = function closeOther(menuId) {
      var $header = $(Selector.MENU_HEADER);

      if (!menuId) {
        var $a = $header.find("a." + Selector.ACTIVE);
        menuId = $a.data(Customer.MENUID);
      }

      $header.find('a').each(function (_index, ele) {
        var flag = $(ele).data(Customer.CLOSE);
        var id = $(ele).data(Customer.MENUID);

        if (flag !== false && id !== menuId) {
          Menu.close(id);
        }
      });
    } // ----------------------------------------------------------------------
    // 关闭全部菜单， 除了不可关闭的
    // ----------------------------------------------------------------------
    ;

    Menu.closeAll = function closeAll() {
      var $header = $(Selector.MENU_HEADER);
      $header.find('a').each(function (_index, ele) {
        var flag = $(ele).data(Customer.CLOSE);
        var menuid = $(ele).data(Customer.MENUID);

        if (flag !== false) {
          Menu.close(menuid);
        }
      });
    } // ----------------------------------------------------------------------
    // 通过menuid打开菜单
    // ----------------------------------------------------------------------
    ;

    Menu.open = function open(menuId, flag) {
      var $header = $(Selector.MENU_HEADER);

      if (!menuId) {
        var $a = $header.find("a." + Selector.ACTIVE);
        menuId = $a.data(Customer.MENUID);
      }

      var select = "[data-" + Customer.MENUID + " = " + menuId + "]";
      var $this = $(Selector.MENU_HEADER).find(select); // 1.1隐藏其他

      $this.siblings().removeClass(Selector.ACTIVE); // 1.2显示自己

      $this.addClass(Selector.ACTIVE); // 1.3关联菜单操作

      var menu = $(Selector.LEFT_MENU);
      menu.find('li,a').removeClass(Selector.ACTIVE);
      var menu$a = menu.find(select).eq(0);
      menu$a.addClass(Selector.ACTIVE); // 2身体操作

      var $body = $(Selector.MENU_BODY).find(select).eq(0); // 2.1隐藏其他

      $body.siblings().removeClass(Selector.ACTIVE); // 2.2显示自己

      $body.addClass(Selector.ACTIVE); // ajax 请求页面

      var bData = $body.data();
      var show = bData[Customer.SHOW] || false;

      if (!show || flag === true) {
        Ajax.getHTML(bData[Customer.URL], bData, Menu.suc($body), Menu.err(menuId));
      }
    };

    Menu.suc = function suc($body) {
      return function (result) {
        $body.data(Customer.SHOW, true);
        $body.html(result).initUI();
      };
    };

    Menu.err = function err(menuId) {
      return function () {
        Menu.close(menuId);
      };
    };

    Menu._jQueryInterface = function _jQueryInterface() {
      return new Menu(this);
    };

    _createClass(Menu, null, [{
      key: "NAME",
      get: function get() {
        return NAME;
      }
    }, {
      key: "Customer",
      get: function get() {
        return Customer;
      }
    }]);

    return Menu;
  }();
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */


  $.fn[NAME] = Menu._jQueryInterface;
  $.fn[NAME].Constructor = Menu;

  $.fn[NAME].noConflict = function () {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return Menu._jQueryInterface;
  };

  return Menu;

}));
//# sourceMappingURL=menu.js.map
