/*!
  * Bootstrap metismenu.js v4.3.1 (http://jiopeel.com/)
  * Copyright 2011-2020 lyc
  */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('jquery'), require('./util.js')) :
  typeof define === 'function' && define.amd ? define(['jquery', './util.js'], factory) :
  (global = global || self, global.MetisMenu = factory(global.jQuery, global.Util));
}(this, function ($, Util) { 'use strict';

  $ = $ && $.hasOwnProperty('default') ? $['default'] : $;
  Util = Util && Util.hasOwnProperty('default') ? Util['default'] : Util;

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

  var NAME = 'metisMenu';
  var DATA_KEY = 'metisMenu';
  var EVENT_KEY = "." + DATA_KEY;
  var DATA_API_KEY = '.data-api';
  var JQUERY_NO_CONFLICT = $.fn[NAME];
  var TRANSITION_DURATION = 350;
  var Default = {
    toggle: true,
    preventDefault: true,
    activeClass: 'active',
    showClass: 'in',
    collapseClass: 'collapse',
    collapseInClass: 'in',
    collapsingClass: 'collapsing',
    triggerElement: 'a',
    parentTrigger: 'li',
    subMenu: 'ul'
  };
  var Event = {
    SHOW: "show" + EVENT_KEY,
    SHOWN: "shown" + EVENT_KEY,
    HIDE: "hide" + EVENT_KEY,
    HIDDEN: "hidden" + EVENT_KEY,
    CLICK_DATA_API: "click" + EVENT_KEY + DATA_API_KEY
  };

  var MetisMenu =
  /*#__PURE__*/
  function () {
    // eslint-disable-line no-shadow
    function MetisMenu(element, config) {
      this.element = element;
      this.config = _objectSpread({}, Default, config);
      this.transitioning = null;
      this.init();
    }

    var _proto = MetisMenu.prototype;

    _proto.init = function init() {
      // eslint-disable-next-line consistent-this
      var self = this;
      var conf = this.config;
      var el = $(this.element);
      el.find(conf.parentTrigger + "." + conf.activeClass).children(conf.triggerElement).attr('aria-expanded', 'true'); // add attribute aria-expanded=true the trigger element

      el.find(conf.parentTrigger + "." + conf.activeClass).parents(conf.parentTrigger).addClass(conf.activeClass);
      el.find(conf.parentTrigger + "." + conf.activeClass).parents(conf.parentTrigger).children(conf.triggerElement).attr('aria-expanded', 'true'); // add attribute aria-expanded=true the triggers of all parents

      el.find(conf.parentTrigger + "." + conf.activeClass).has(conf.subMenu).children(conf.subMenu).addClass(conf.collapseClass + " " + conf.showClass);
      el.find(conf.parentTrigger).not("." + conf.activeClass).has(conf.subMenu).children(conf.subMenu).addClass(conf.collapseClass);
      el.find(conf.parentTrigger) // .has(conf.subMenu)
      .children(conf.triggerElement).on(Event.CLICK_DATA_API, function (e) {
        // eslint-disable-line func-names
        var eTar = $(this);

        if (eTar.attr('aria-disabled') === 'true') {
          return;
        }

        if (conf.preventDefault && eTar.attr('href') === '#') {
          e.preventDefault();
        }

        var paRent = eTar.parent(conf.parentTrigger);
        var sibLi = paRent.siblings(conf.parentTrigger);
        var sibTrigger = sibLi.children(conf.triggerElement);

        if (paRent.hasClass(conf.activeClass)) {
          eTar.attr('aria-expanded', 'false');
          self.removeActive(paRent);
        } else {
          eTar.attr('aria-expanded', 'true');
          self.setActive(paRent);

          if (conf.toggle) {
            self.removeActive(sibLi);
            sibTrigger.attr('aria-expanded', 'false');
          }
        }

        if (conf.onTransitionStart) {
          conf.onTransitionStart(e);
        }
      });
    };

    _proto.setActive = function setActive(li) {
      $(li).addClass(this.config.activeClass);
      var ul = $(li).children(this.config.subMenu);

      if (ul.length > 0 && !ul.hasClass(this.config.showClass)) {
        this.show(ul);
      }
    };

    _proto.removeActive = function removeActive(li) {
      $(li).removeClass(this.config.activeClass);
      var ul = $(li).children(this.config.subMenu + "." + this.config.showClass);

      if (ul.length > 0) {
        this.hide(ul);
      }
    };

    _proto.show = function show(element) {
      var _this = this;

      if (this.transitioning || $(element).hasClass(this.config.collapsingClass)) {
        return;
      }

      var elem = $(element);
      var startEvent = $.Event(Event.SHOW);
      elem.trigger(startEvent);

      if (startEvent.isDefaultPrevented()) {
        return;
      }

      elem.parent(this.config.parentTrigger).addClass(this.config.activeClass);

      if (this.config.toggle) {
        var toggleElem = elem.parent(this.config.parentTrigger).siblings().children(this.config.subMenu + "." + this.config.showClass);
        this.hide(toggleElem);
      }

      elem.removeClass(this.config.collapseClass).addClass(this.config.collapsingClass).height(0);
      this.setTransitioning(true);

      var complete = function complete() {
        // check if disposed
        if (!_this.config || !_this.element) {
          return;
        }

        elem.removeClass(_this.config.collapsingClass).addClass(_this.config.collapseClass + " " + _this.config.showClass).height('');

        _this.setTransitioning(false);

        elem.trigger(Event.SHOWN);
      };

      elem.height(element[0].scrollHeight).one(Util.TRANSITION_END, complete).emulateTransitionEnd(TRANSITION_DURATION);
    };

    _proto.hide = function hide(element) {
      var _this2 = this;

      if (this.transitioning || !$(element).hasClass(this.config.showClass)) {
        return;
      }

      var elem = $(element);
      var startEvent = $.Event(Event.HIDE);
      elem.trigger(startEvent);

      if (startEvent.isDefaultPrevented()) {
        return;
      }

      elem.parent(this.config.parentTrigger).removeClass(this.config.activeClass); // eslint-disable-next-line no-unused-expressions

      elem.height(elem.height())[0].offsetHeight;
      elem.addClass(this.config.collapsingClass).removeClass(this.config.collapseClass).removeClass(this.config.showClass);
      this.setTransitioning(true);

      var complete = function complete() {
        // check if disposed
        if (!_this2.config || !_this2.element) {
          return;
        }

        if (_this2.transitioning && _this2.config.onTransitionEnd) {
          _this2.config.onTransitionEnd();
        }

        _this2.setTransitioning(false);

        elem.trigger(Event.HIDDEN);
        elem.removeClass(_this2.config.collapsingClass).addClass(_this2.config.collapseClass);
      };

      if (elem.height() === 0 || elem.css('display') === 'none') {
        complete();
      } else {
        elem.height(0).one(Util.TRANSITION_END, complete).emulateTransitionEnd(TRANSITION_DURATION);
      }
    };

    _proto.setTransitioning = function setTransitioning(isTransitioning) {
      this.transitioning = isTransitioning;
    };

    _proto.dispose = function dispose() {
      $.removeData(this.element, DATA_KEY);
      $(this.element).find(this.config.parentTrigger) // .has(this.config.subMenu)
      .children(this.config.triggerElement).off(Event.CLICK_DATA_API);
      this.transitioning = null;
      this.config = null;
      this.element = null;
    };

    MetisMenu.jQueryInterface = function jQueryInterface(config) {
      // eslint-disable-next-line func-names
      return this.each(function () {
        var $this = $(this);
        var data = $this.data(DATA_KEY);

        var conf = _objectSpread({}, Default, $this.data(), typeof config === 'object' && config ? config : {});

        if (!data) {
          data = new MetisMenu(this, conf);
          $this.data(DATA_KEY, data);
        }

        if (typeof config === 'string') {
          if (data[config] === undefined) {
            throw new Error("No method named \"" + config + "\"");
          }

          data[config]();
        }
      });
    };

    return MetisMenu;
  }();
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */


  $.fn[NAME] = MetisMenu.jQueryInterface; // eslint-disable-line no-param-reassign

  $.fn[NAME].Constructor = MetisMenu; // eslint-disable-line no-param-reassign

  $.fn[NAME].noConflict = function () {
    // eslint-disable-line no-param-reassign
    $.fn[NAME] = JQUERY_NO_CONFLICT; // eslint-disable-line no-param-reassign

    return MetisMenu.jQueryInterface;
  };

  return MetisMenu;

}));
//# sourceMappingURL=metismenu.js.map
