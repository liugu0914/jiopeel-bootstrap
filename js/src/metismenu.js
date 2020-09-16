import $ from 'jquery'
import Util from './util'

const NAME = 'metisMenu'
const DATA_KEY = 'metisMenu'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'
const JQUERY_NO_CONFLICT = $.fn[NAME]
const TRANSITION_DURATION = 350

const Default = {
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
}

const Event = {
  SHOW: `show${EVENT_KEY}`,
  SHOWN: `shown${EVENT_KEY}`,
  HIDE: `hide${EVENT_KEY}`,
  HIDDEN: `hidden${EVENT_KEY}`,
  CLICK_DATA_API: `click${EVENT_KEY}${DATA_API_KEY}`
}


class MetisMenu {
  // eslint-disable-line no-shadow
  constructor(element, config) {
    this.element = element
    this.config = {
      ...Default,
      ...config
    }
    this.transitioning = null

    this.init()
  }

  init() {
    // eslint-disable-next-line consistent-this
    const self = this
    const conf = this.config
    const el = $(this.element)

    el.find(`${conf.parentTrigger}.${conf.activeClass}`)
      .children(conf.triggerElement)
      .attr('aria-expanded', 'true') // add attribute aria-expanded=true the trigger element

    el.find(`${conf.parentTrigger}.${conf.activeClass}`)
      .parents(conf.parentTrigger)
      .addClass(conf.activeClass)

    el.find(`${conf.parentTrigger}.${conf.activeClass}`)
      .parents(conf.parentTrigger)
      .children(conf.triggerElement)
      .attr('aria-expanded', 'true') // add attribute aria-expanded=true the triggers of all parents

    el.find(`${conf.parentTrigger}.${conf.activeClass}`)
      .has(conf.subMenu)
      .children(conf.subMenu)
      .addClass(`${conf.collapseClass} ${conf.showClass}`)

    el.find(conf.parentTrigger)
      .not(`.${conf.activeClass}`)
      .has(conf.subMenu)
      .children(conf.subMenu)
      .addClass(conf.collapseClass)

    el.find(conf.parentTrigger)
      // .has(conf.subMenu)
      .children(conf.triggerElement)
      .on(Event.CLICK_DATA_API, function (e) { // eslint-disable-line func-names
        const eTar = $(this)

        if (eTar.attr('aria-disabled') === 'true') {
          return
        }

        if (conf.preventDefault && eTar.attr('href') === '#') {
          e.preventDefault()
        }

        const paRent = eTar.parent(conf.parentTrigger)
        const sibLi = paRent.siblings(conf.parentTrigger)
        const sibTrigger = sibLi.children(conf.triggerElement)

        if (paRent.hasClass(conf.activeClass)) {
          eTar.attr('aria-expanded', 'false')
          self.removeActive(paRent)
        } else {
          eTar.attr('aria-expanded', 'true')
          self.setActive(paRent)
          if (conf.toggle) {
            self.removeActive(sibLi)
            sibTrigger.attr('aria-expanded', 'false')
          }
        }

        if (conf.onTransitionStart) {
          conf.onTransitionStart(e)
        }
      })
  }

  setActive(li) {
    $(li).addClass(this.config.activeClass)
    const ul = $(li).children(this.config.subMenu)
    if (ul.length > 0 && !ul.hasClass(this.config.showClass)) {
      this.show(ul)
    }
  }

  removeActive(li) {
    $(li).removeClass(this.config.activeClass)
    const ul = $(li).children(`${this.config.subMenu}.${this.config.showClass}`)
    if (ul.length > 0) {
      this.hide(ul)
    }
  }

  show(element) {
    if (this.transitioning || $(element).hasClass(this.config.collapsingClass)) {
      return
    }
    const elem = $(element)

    const startEvent = $.Event(Event.SHOW)
    elem.trigger(startEvent)

    if (startEvent.isDefaultPrevented()) {
      return
    }

    elem.parent(this.config.parentTrigger).addClass(this.config.activeClass)

    if (this.config.toggle) {
      const toggleElem = elem.parent(this.config.parentTrigger).siblings().children(`${this.config.subMenu}.${this.config.showClass}`)
      this.hide(toggleElem)
    }

    elem.removeClass(this.config.collapseClass)
      .addClass(this.config.collapsingClass)
      .height(0)

    this.setTransitioning(true)

    const complete = () => {
      // check if disposed
      if (!this.config || !this.element) {
        return
      }
      elem.removeClass(this.config.collapsingClass)
        .addClass(`${this.config.collapseClass} ${this.config.showClass}`)
        .height('')

      this.setTransitioning(false)

      elem.trigger(Event.SHOWN)
    }

    elem.height(element[0].scrollHeight)
      .one(Util.TRANSITION_END, complete)
      .emulateTransitionEnd(TRANSITION_DURATION)
  }

  hide(element) {
    if (
      this.transitioning || !$(element).hasClass(this.config.showClass)
    ) {
      return
    }

    const elem = $(element)

    const startEvent = $.Event(Event.HIDE)
    elem.trigger(startEvent)

    if (startEvent.isDefaultPrevented()) {
      return
    }

    elem.parent(this.config.parentTrigger).removeClass(this.config.activeClass)
    // eslint-disable-next-line no-unused-expressions
    elem.height(elem.height())[0].offsetHeight

    elem.addClass(this.config.collapsingClass)
      .removeClass(this.config.collapseClass)
      .removeClass(this.config.showClass)

    this.setTransitioning(true)

    const complete = () => {
      // check if disposed
      if (!this.config || !this.element) {
        return
      }
      if (this.transitioning && this.config.onTransitionEnd) {
        this.config.onTransitionEnd()
      }

      this.setTransitioning(false)
      elem.trigger(Event.HIDDEN)

      elem.removeClass(this.config.collapsingClass)
        .addClass(this.config.collapseClass)
    }

    if (elem.height() === 0 || elem.css('display') === 'none') {
      complete()
    } else {
      elem.height(0)
        .one(Util.TRANSITION_END, complete)
        .emulateTransitionEnd(TRANSITION_DURATION)
    }
  }

  setTransitioning(isTransitioning) {
    this.transitioning = isTransitioning
  }

  dispose() {
    $.removeData(this.element, DATA_KEY)

    $(this.element)
      .find(this.config.parentTrigger)
      // .has(this.config.subMenu)
      .children(this.config.triggerElement)
      .off(Event.CLICK_DATA_API)

    this.transitioning = null
    this.config = null
    this.element = null
  }

  static jQueryInterface(config) {
    // eslint-disable-next-line func-names
    return this.each(function () {
      const $this = $(this)
      let data = $this.data(DATA_KEY)
      const conf = {
        ...Default,
        ...$this.data(),
        ...typeof config === 'object' && config ? config : {}
      }

      if (!data) {
        data = new MetisMenu(this, conf)
        $this.data(DATA_KEY, data)
      }

      if (typeof config === 'string') {
        if (data[config] === undefined) {
          throw new Error(`No method named "${config}"`)
        }
        data[config]()
      }
    })
  }
}
/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 */

$.fn[NAME] = MetisMenu.jQueryInterface // eslint-disable-line no-param-reassign
$.fn[NAME].Constructor = MetisMenu // eslint-disable-line no-param-reassign
$.fn[NAME].noConflict = () => {
  // eslint-disable-line no-param-reassign
  $.fn[NAME] = JQUERY_NO_CONFLICT // eslint-disable-line no-param-reassign
  return MetisMenu.jQueryInterface
}

export default MetisMenu
