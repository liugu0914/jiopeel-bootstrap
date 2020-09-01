import $ from 'jquery'
import Ajax from './ajax'

const NAME = 'menu'
const DATA_KEY = 'lyc.menu'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'
const JQUERY_NO_CONFLICT = $.fn[NAME]

const Event = {
  CLICK_DATA_API: `click${EVENT_KEY}${DATA_API_KEY}`,
  CLICK_CLOSE_DATA_API: `click.close${EVENT_KEY}${DATA_API_KEY}`
}

const Customer = {
  MENUID: 'menuid',
  URL: 'url',
  NAME: 'name',
  ICON: 'icon',
  CLOSE: 'close',
  SHOW: 'show'
}

const HTML_CONTEXT = {
  HEADER: `<a class="home-page" href="#" 
            data-${Customer.URL}="{{${Customer.URL}}}"
            data-${Customer.MENUID}="{{${Customer.MENUID}}}">
            {{${Customer.ICON}}} {{${Customer.NAME}}} 
            {{${Customer.CLOSE}}}
            </a>`,
  BODY: `<div class="iframe-content" data-${Customer.MENUID}="{{${Customer.MENUID}}}"></div>`,
  CLOSE: '<i class="cs cs-guanbi"></i>'
}

const Selector = {
  MENU_HEADER: '#menu-list',
  MENU_BODY: '#page-content',
  ACTIVE: 'active',
  LEFT_MENU: '.metismenu',
  CLOSE: '.cs.cs-guanbi'
}

/**
 * ------------------------------------------------------------------------
 *  菜单生产
 *  @author lyc
 *  @date 2020年06月04日17:48:50
 * ------------------------------------------------------------------------
 */
class Menu {
  constructor(element) {
    this._element = element
    this.init()
    return this
  }
  static get NAME() {
    return NAME
  }

  static get Customer() {
    return Customer
  }

  // ----------------------------------------------------------------------
  // 初始化
  // ----------------------------------------------------------------------
  init() {
    const data = $(this._element).data()
    const $header = $(Selector.MENU_HEADER)
    const $body = $(Selector.MENU_BODY)
    if ($header.length === 0 || $body.length === 0 || !data[Customer.URL]) {
      return
    }
    const select = `[data-${Customer.MENUID} = ${data[Customer.MENUID]}]`
    let $a = $header.find(select)
    if ($a.length === 0) {
      // 生产头部
      let headerDiv = HTML_CONTEXT.HEADER
      headerDiv = headerDiv.replace(new RegExp(`{{${Customer.URL}}}`, 'g'), data[Customer.URL])
      headerDiv = headerDiv.replace(new RegExp(`{{${Customer.MENUID}}}`, 'g'), data[Customer.MENUID])
      headerDiv = headerDiv.replace(new RegExp(`{{${Customer.CLOSE}}}`, 'g'), data[Customer.CLOSE] === false ? '' : HTML_CONTEXT.CLOSE)
      headerDiv = headerDiv.replace(new RegExp(`{{${Customer.ICON}}}`, 'g'), data[Customer.ICON] ? `<i class ="${data[Customer.ICON]}"></i>` : '')
      headerDiv = headerDiv.replace(new RegExp(`{{${Customer.NAME}}}`, 'g'), data[Customer.NAME])
      $a = $(headerDiv).appendTo($header)
    }

    let $b = $body.find(select)
    if ($b.find(select).length === 0) {
      // 生产身体
      let bodyDiv = HTML_CONTEXT.BODY
      bodyDiv = bodyDiv.replace(new RegExp(`{{${Customer.MENUID}}}`, 'g'), data[Customer.MENUID])
      $b = $(bodyDiv).appendTo($body)
      $b.data({
        ...$b.data(),
        ...data
      })
    }
    $a.on(Event.CLICK_DATA_API, this.click)
    // 直接触发
    $a.trigger($.Event(Event.CLICK_DATA_API))
    // 关闭标签 的初始化
    $a.find(Selector.CLOSE).on(Event.CLICK_CLOSE_DATA_API, this.closeLable)
  }

  // ----------------------------------------------------------------------
  // i标签关闭功能触发
  // ----------------------------------------------------------------------
  closeLable(event) {
    if (event) {
      event.preventDefault()
    }
    // 1头部操作
    const $this = $(event.target)
    const $a = $this.closest('a')
    const data = $a.data()
    Menu.close(data[Customer.MENUID])
  }

  // ----------------------------------------------------------------------
  // a标签点击功能触发
  // ----------------------------------------------------------------------
  click(event) {
    if (event) {
      event.preventDefault()
    }
    const $this = $(event.currentTarget)
    const data = $this.data()
    Menu.open(data[Customer.MENUID])
  }

  // ----------------------------------------------------------------------
  // 通过menuid关闭菜单
  // ----------------------------------------------------------------------
  static close(menuId) {
    if (!menuId) {
      const $header = $(Selector.MENU_HEADER)
      const $a = $header.find(`a.${Selector.ACTIVE}`)
      menuId = $a.data(Customer.MENUID)
    }
    // 1头部操作
    const select = `[data-${Customer.MENUID} = ${menuId}]`
    const $a = $(Selector.MENU_HEADER).find(select)
    // 关闭之后默认获取最近的一个
    // eslint-disable-next-line no-nested-ternary
    const $round = $a.prev().length !== 0 ? $a.prev() : $a.next().length !== 0 ? $a.next() : null
    const $preva = $a.hasClass(Selector.ACTIVE) ? $round : null
    const $body = $(Selector.MENU_BODY).find(select).eq(0)
    // 关闭自身
    $a.remove()
    $body.remove()

    if ($preva && $preva.length !== 0) {
      $preva.addClass(Selector.ACTIVE)
      const prevSelect = `[data-${Customer.MENUID} = ${$preva.data(Customer.MENUID)}]`
      const $prevbody = $(Selector.MENU_BODY).find(prevSelect).eq(0)
      $prevbody.addClass(Selector.ACTIVE)
    }
  }

  // ----------------------------------------------------------------------
  // 通过menuid关闭其他菜单
  // ----------------------------------------------------------------------
  static closeOther(menuId) {
    const $header = $(Selector.MENU_HEADER)
    if (!menuId) {
      const $a = $header.find(`a.${Selector.ACTIVE}`)
      menuId = $a.data(Customer.MENUID)
    }
    $header.find('a').each((_index, ele) => {
      const flag = $(ele).data(Customer.CLOSE)
      const id = $(ele).data(Customer.MENUID)
      if (flag !== false && id !== menuId) {
        Menu.close(id)
      }
    })
  }

  // ----------------------------------------------------------------------
  // 关闭全部菜单， 除了不可关闭的
  // ----------------------------------------------------------------------
  static closeAll() {
    const $header = $(Selector.MENU_HEADER)
    $header.find('a').each((_index, ele) => {
      const flag = $(ele).data(Customer.CLOSE)
      const menuid = $(ele).data(Customer.MENUID)
      if (flag !== false) {
        Menu.close(menuid)
      }
    })
  }

  // ----------------------------------------------------------------------
  // 通过menuid打开菜单
  // ----------------------------------------------------------------------
  static open(menuId, flag) {
    const $header = $(Selector.MENU_HEADER)
    if (!menuId) {
      const $a = $header.find(`a.${Selector.ACTIVE}`)
      menuId = $a.data(Customer.MENUID)
    }
    const select = `[data-${Customer.MENUID} = ${menuId}]`
    const $this = $(Selector.MENU_HEADER).find(select)
    // 1.1隐藏其他
    $this.siblings().removeClass(Selector.ACTIVE)
    // 1.2显示自己
    $this.addClass(Selector.ACTIVE)
    // 1.3关联菜单操作
    const menu = $(Selector.LEFT_MENU)
    menu.find('li,a').removeClass(Selector.ACTIVE)
    const menu$a = menu.find(select).eq(0)
    menu$a.addClass(Selector.ACTIVE)
    // 2身体操作
    const $body = $(Selector.MENU_BODY).find(select).eq(0)
    // 2.1隐藏其他
    $body.siblings().removeClass(Selector.ACTIVE)
    // 2.2显示自己
    $body.addClass(Selector.ACTIVE)
    // ajax 请求页面
    const bData = $body.data()
    const show = bData[Customer.SHOW] || false
    if (!show || flag === true) {
      Ajax.getHTML(bData[Customer.URL], bData, Menu.suc($body), Menu.err(menuId))
    }
  }

  static suc($body) {
    return (result) => {
      $body.data(Customer.SHOW, true)
      $body.html(result).initUI()
    }
  }

  static err(menuId) {
    return () => {
      Menu.close(menuId)
    }
  }

  static _jQueryInterface() {
    return new Menu(this)
  }
}

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 */
$.fn[NAME] = Menu._jQueryInterface
$.fn[NAME].Constructor = Menu
$.fn[NAME].noConflict = () => {
  $.fn[NAME] = JQUERY_NO_CONFLICT
  return Menu._jQueryInterface
}

export default Menu
