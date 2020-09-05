import $ from 'jquery'
import Ajax from './ajax'
import Confirm from './confirm'
import Tool from './tool'

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
  SHOW: 'show',
  CHECK: 'chk',
  CUSTOM: 'cus',
  BEFORE: 'bef',
  SUCCESS: 'suc',
  WARN: 'warn'
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
  CLOSE: '.cs.cs-guanbi',
  BODY_CLASS: '.iframe-content'
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
    this.config = this.getConfig()
    this.init()
    return this
  }
  static get NAME() {
    return NAME
  }

  static get Customer() {
    return Customer
  }

  getConfig() {
    const config = $(this._element).data()
    if (!config[Customer.URL]) {
      config[Customer.URL] = $(this._element).attr('href')
    }
    return config
  }

  // ----------------------------------------------------------------------
  // 初始化
  // ----------------------------------------------------------------------
  init() {
    const $header = $(Selector.MENU_HEADER)
    const $body = $(Selector.MENU_BODY)
    if ($header.length === 0 || $body.length === 0 || !this.config[Customer.URL]) {
      return
    }
    // 处理事件链 事件顺序:[chk , cus, bef ,suc]
    const flag = this.chain()
    if (!flag) { // 为false 直接结束
      return
    }
    const data = this.config
    // 菜单id不存在 则自动生成一个
    if (!data[Customer.MENUID]) {
      data[Customer.MENUID] = `menuid_${new Date().getTime()}`
      $(this._element).data(Customer.MENUID, data[Customer.MENUID])
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
    } else {
      $a.trigger($.Event(Event.CLICK_DATA_API))
      return
    }
    $a.data({
      ...$a.data(),
      ...this.config
    })
    let $b = $body.find(select + Selector.BODY_CLASS)
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
  // 事件顺序:[chk , cus, bef ,suc]
  // ----------------------------------------------------------------------
  chain() {
    const chk = Tool.eval(this.config[Customer.CHECK])
    if (typeof chk === 'function') {
      const flag = chk($(this._element), this.config)
      if (typeof flag === 'boolean' && !flag) {
        return false
      }
    }
    // 自定义函数式  用于封装数据
    const cus = Tool.eval(this.config[Customer.CUSTOM])
    if (cus && typeof cus === 'object' && typeof cus.fuc === 'function') {
      const rescus = cus.fuc.call(this._element, ...cus.args)
      if (rescus && typeof rescus === 'object') {
        this.config = {
          ...this.config,
          ...rescus
        }
      } else if (typeof rescus === 'boolean' && !rescus) {
        return false
      } else {
        return false
      }
    }

    const warn = this.config[Customer.WARN]
    if (warn) {
      const confirm = new Confirm(warn)
      confirm.ok(() => this._chainOver($(this._element), this.config)).show()
    } else {
      this._chainOver($(this._element), this.config)
    }
    return true
  }

  _chainOver($this, config) {
    const bef = Tool.eval(config[Customer.BEFORE])
    if (typeof bef === 'function') {
      const obj = bef($this, config)
      this.config = {
        ...config,
        ...typeof obj === 'object' && obj ? obj : {}
      }
    }
    this.config[Customer.SUCCESS] = Tool.eval(config[Customer.SUCCESS])
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
    if (!menuId) {
      return
    }
    // 1头部操作
    const select = `[data-${Customer.MENUID} = ${menuId}]`
    const $a = $(Selector.MENU_HEADER).find(select)
    // 关闭之后默认获取最近的一个
    // eslint-disable-next-line no-nested-ternary
    const $round = $a.prev().length !== 0 ? $a.prev() : $a.next().length !== 0 ? $a.next() : null
    const $preva = $a.hasClass(Selector.ACTIVE) ? $round : null
    const $body = $(Selector.MENU_BODY).find(select + Selector.BODY_CLASS).eq(0)
    // 关闭自身
    $a.remove()
    $body.remove()

    if ($preva && $preva.length !== 0) {
      $preva.addClass(Selector.ACTIVE)
      const prevSelect = `[data-${Customer.MENUID} = ${$preva.data(Customer.MENUID)}]${Selector.BODY_CLASS}`
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
    if (!menuId) {
      return
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
    const $body = $(Selector.MENU_BODY).find(select + Selector.BODY_CLASS).eq(0)
    // 2.1隐藏其他
    $body.siblings().removeClass(Selector.ACTIVE)
    // 2.2显示自己
    $body.addClass(Selector.ACTIVE)
    // jq深复制
    const bData = $.extend(true, {}, $body.data())
    const show = bData[Customer.SHOW] || false
    const array = []
    for (const ckey in Customer) {
      if (array.indexOf(Customer[ckey]) < 0) {
        array.push(Customer[ckey])
      }
    }
    for (const key in bData) {
      if (array.indexOf(key) > -1) {
        delete bData[key]
      }
    }
    if (!show || flag === true) {
      Ajax.getHTML($body.data(Customer.URL), bData, Menu.suc($this, $body), Menu.err(menuId))
    }
  }

  static suc($header, $body) {
    const config = $header.data()
    const suc = config[Customer.SUCCESS]
    return (result) => {
      $body.data(Customer.SHOW, true)
      const content = $body.html(result)
      content.initUI()
      if (typeof suc === 'function') {
        suc($(content), config)
      }
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
