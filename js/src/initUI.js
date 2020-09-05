import $ from 'jquery'
import Ajax from './ajax.js'
import Confirm from './confirm.js'
import Editor from './editor.js'
import Menu from './menu.js'
import Toast from './toast.js'
import Tool from './tool.js'
import Tree from './tree.js'
import Upload from './upload.js'


/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */


const NAME = 'initUI'
const VERSION = '1.0.0'
const DATA_KEY = 'lyc.init'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_INFO = `${DATA_KEY}.`
const DATA_API_KEY = '.data-api'
const JQUERY_NO_CONFLICT = $.fn[NAME]

const Selector = {
  MENU: '[target="menu"]',
  TAB: '[target="tab"]',
  SEARCH: '[target="search"]',
  SELECT: '[target="select"]',
  QUERY: '[target="query"]',
  FORM: '[target="form"]',
  AJAX: '[target="ajax"]',
  HTML: '[target="html"]',
  CLEAR: '[target="clear"]',
  PAGE: '[target="page"]',
  TREE: '[target="tree"]',
  EDITOR: '[target="editor"]',
  FILE: '[target="file"]',
  TOOLTIP: '[show="tooltip"]',
  ERROR_IMG: 'img[src-error]',

  INIT: 'data-init',
  NAV_LIST_GROUP: '.nav, .list-group',
  ACTIVE: '.active',
  ACTIVE_UL: '> li > .active'
}

const Event = {
  CLICK_MENU: `click.menu${EVENT_KEY}${DATA_API_KEY}`,
  CLICK_QUERY: `click.query${EVENT_KEY}${DATA_API_KEY}`,
  CLICK_FORM: `click.form${EVENT_KEY}${DATA_API_KEY}`,
  CLICK_AJAX: `click.ajax${EVENT_KEY}${DATA_API_KEY}`,
  CLICK_DATA_API: `click${EVENT_KEY}${DATA_API_KEY}`,
  CHANGE_DATA_API: `change${EVENT_KEY}${DATA_API_KEY}`,
  ERROR_IMG: `error.img${EVENT_KEY}${DATA_API_KEY}`
}

const ClassName = {
  QUERY_MAIN: '.query-main',
  QUERY_DATA: '.query-data',
  MODAL_CONTENT: '.modal-content',
  PAGE_LINK: '.page-link',
  CHECK_ALL: '.chk-all',
  CHECK: '.chk',
  ZTREE: 'ztree',
  WARN: 'warn',
  ACTIVE: 'active'
}

const Customer = {
  CHECK: 'chk',
  CUSTOM: 'cus',
  BEFORE: 'bef',
  SUCCESS: 'suc'
}

const DataKey = {
  QUERY: `${DATA_INFO}query`,
  TREE: 'tree',
  EDITOR: 'editor',
  FILE: 'file'
}

/**
 * ------------------------------------------------------------------------
 *  初始化方法 init()
 *  @author lyc
 *  @date 2020年06月04日17:48:50
 * ------------------------------------------------------------------------
 */

class InitUI {
  constructor(element, callback, start) {
    this._element = element
    this.verifyJQuery()
    this.menu()
    this.imgError()
    this.tooltip()
    if (this.verifySelect2()) {
      this.search()
      this.select()
    }
    this.clear()
    this.checkbox()
    this.query()
    this.form()
    this.ajax()
    this.html()
    this.page()
    this.tree()
    this.file()
    this.editor()

    this._callback = callback && typeof callback === 'function' ? callback : this.initFuc()
    // eslint-disable-next-line no-undefined
    if (start === true || start === null || start === undefined) {
      this.start()
    }
    return this
  }

  static get VERSION() {
    return VERSION
  }

  verifyJQuery() {
    if (!$ || !$.fn) {
      throw new TypeError('JQuery is not load, plz check out')
    }
  }

  // ----------------------------------------------------------------------
  //  打开菜单操作
  // ----------------------------------------------------------------------
  menu() {
    $(Selector.MENU, this._element).on(Event.CLICK_MENU, (event) => {
      if (event) {
        event.preventDefault()
      }
      return new Menu(event.currentTarget)
    })
  }

  // ----------------------------------------------------------------------
  //  图片错误加载
  // ----------------------------------------------------------------------
  imgError() {
    $(Selector.ERROR_IMG, this._element).each((index, element) => {
      const $this = $(element)
      let src = $this.attr('src')
      $this.on(Event.ERROR_IMG, () => {
        const attr = $this.attr('src-error')
        if (!attr) {
          src = '/img/user.png'
        }
        if (attr === 'user') {
          src = '/img/user.png'
        } else if (attr === 'img') {
          src = '/img/img.png'
        }
        return $this.attr('src', src)
      })
      const error = $.Event(Event.ERROR_IMG)
      return src && src !== window.location.href ? $this.attr('src', src) : $this.trigger(error)
    })
  }

  // ----------------------------------------------------------------------
  //  提示插件 需要tooltip.js
  // ----------------------------------------------------------------------
  tooltip() {
    if ($.fn.tooltip) {
      $(Selector.TOOLTIP, this._element).tooltip({
        bgcolor: 'dark'
      })
    }
  }

  // ----------------------------------------------------------------------
  //  验证是否存在select2插件
  //  给select2插件中文国际化
  // ----------------------------------------------------------------------
  verifySelect2() {
    if (!$.fn.select2) {
      // eslint-disable-next-line no-console
      console.error('the select2 plugin do not loaded')
      return false
    }
    if ($.fn.select2.amd) {
      const e = $.fn.select2.amd
      e.define('select2/i18n/zh-CN', [], () => ({
        errorLoading() {
          return '无法载入结果。'
        },
        inputTooLong(e) {
          const t = e.input.length - e.maximum
          const n = `请删除${t}个字符`
          return n
        },
        inputTooShort(e) {
          const t = e.minimum - e.input.length
          const n = `请再输入至少${t}个字符`
          return n
        },
        loadingMore() {
          return '载入更多结果…'
        },
        maximumSelected(e) {
          const t = `最多只能选择${e.maximum}个项目`
          return t
        },
        noResults() {
          return '未找到结果'
        },
        searching() {
          return '搜索中…'
        }
      }))
    }
    return true
  }

  // ----------------------------------------------------------------------
  //  select2插件ajax获取数据
  // ----------------------------------------------------------------------
  search() {
    $(Selector.SEARCH, this._element).each((index, element) => {
      const $this = $(element)
      const id = $this.data('id')
      const text = $this.data('text')
      const op = {
        placeholder: '请选择',
        // allowClear : true,
        ajax: {
          url: $this.data('url'),
          delay: 250,
          data(params) {
            let query = {
              search: params.term
            }
            query = $.extend(query, $this.data())
            return query
          },
          dataType: Ajax.JSON,
          type: Ajax.POST,
          processResults(result) {
            let data = []
            if (result.data) {
              data = $.map(result.data, (obj) => {
                obj.text = obj.text || obj.name
                return obj
              })
            }
            return {
              results: data
            }
          }
        },
        templateSelection: formatState,
        templateResult: formatState,
        minimumInputLength: 0,
        maximumSelectionLength: 100
      }
      function formatState(state) {
        const pattern = /<(?:[^"'>]|"[^"]*"|'[^']*')*>/g
        if (!state.id) {
          return state.text
        }
        return state.text && pattern.test(state.text) ? $(state.text) : state.text
      }
      $this.select2(op)
      if ($this.hasClass('select2-hidden-accessible') && id) {
        const option = new Option(text, id, true, true)
        $this.append(option).trigger('change')
      }
    })
  }

  // ----------------------------------------------------------------------
  //  select2前台数据(相当于原生select)
  //  目的在于统一样式
  // ----------------------------------------------------------------------
  select() {
    $(Selector.SELECT, this._element).each((index, element) => {
      $(element).select2({
        minimumResultsForSearch: Infinity
      })
    })
  }

  // ----------------------------------------------------------------------
  //  重置form表单元素
  // ----------------------------------------------------------------------
  clear() {
    $(Selector.CLEAR, this._element).on(Event.CLICK_DATA_API, (event) => {
      if (event) {
        event.preventDefault()
      }
      const $this = $(event.currentTarget)
      let $form
      if ($this.closest('form').length !== 0) {
        $form = $this.closest('form')
      } else if ($this.closest(ClassName.QUERY_MAIN).find('form').length !== 0) {
        $form = $this.closest(ClassName.QUERY_MAIN).find('form')
      } else if ($this.closest(ClassName.MODAL_CONTENT).find('form').length !== 0) {
        $form = $this.closest(ClassName.MODAL_CONTENT).find('form')
      } else {
        return
      }
      const attrs = $form.find('input,select,textarea')
      attrs.each((index, element) => {
        const $this = $(element)
        if ($this.hasClass('select2-hidden-accessible')) {
          const target = $this.attr('target')
          if (target === 'search') {
            return $this.empty()
          }
          if (target === 'select') {
            return $this.select2('val', ' ')// 预留空格
          }
        }
        return $this.val('')
      })
    })
  }

  checkbox() {
    $(ClassName.CHECK_ALL, this._element).each((index, element) => {
      const $this = $(element)
      const $querydata = $this.closest(ClassName.QUERY_DATA)
      const chks = $querydata.find('.chk')
      $this.on(Event.CLICK_DATA_API, (event) => {
        chks.prop('checked', $(event.target).prop('checked'))
      })
      chks.on(Event.CHANGE_DATA_API, () => {
        const ischked = $querydata.find('.chk:checked')
        if (ischked.length === 0) {
          $this.prop('indeterminate', false)
          $this.prop('checked', false)
          return
        }

        if (ischked.length !== 0 && chks.length === ischked.length) {
          $this.prop('indeterminate', false)
          $this.prop('checked', true)
          return
        }
        if (ischked.length !== 0 && chks.length !== ischked.length) {
          $this.prop('indeterminate', true)
        }
      })
    })
  }

  // ----------------------------------------------------------------------
  //  主页面查询表单控件
  // ----------------------------------------------------------------------
  query() {
    $(Selector.QUERY, this._element).on(Event.CLICK_QUERY, (event) => {
      if (event) {
        event.preventDefault()
      }
      const $this = $(event.currentTarget)
      $this.blur()
      let $form
      if ($this.closest('form').length !== 0) {
        $form = $this.closest('form')
      } else if ($this.closest(ClassName.QUERY_MAIN).find('form').length !== 0) {
        $form = $this.closest(ClassName.QUERY_MAIN).find('form').eq(0)
      } else {
        return
      }
      const data = $this.data()
      const url = data.url ? data.url : $this.attr('href')
      const config = {
        ...$form.data(),
        ...data,
        ...{
          url: $form.attr('action') || url,
          data: Tool.formData($form),
          type: Ajax.POST,
          dataType: Ajax.HTML
        }
      }
      $this.closest(ClassName.QUERY_MAIN).data(DataKey.QUERY)
      this._ajaxUseful($this, config)
    })
  }

  // ----------------------------------------------------------------------
  //  用于form提交
  // ----------------------------------------------------------------------
  form() {
    $(Selector.FORM, this._element).on(Event.CLICK_FORM, (event) => {
      if (event) {
        event.preventDefault()
      }
      const $this = $(event.currentTarget)
      $this.blur()
      let $form
      if ($this.closest('form').length !== 0) {
        $form = $this.closest('form')
      } else if ($this.closest(ClassName.MODAL_CONTENT).find('form').length !== 0) {
        $form = $this.closest(ClassName.MODAL_CONTENT).find('form').eq(0)
      } else if ($this.closest(ClassName.QUERY_MAIN).find('form').length !== 0) {
        $form = $this.closest(ClassName.QUERY_MAIN).find('form').eq(0)
      } else {
        return
      }
      const data = $this.data()
      const url = data.url ? data.url : $this.attr('href')
      const config = {
        ...$form.data(),
        ...data,
        ...{
          url: $form.attr('action') || url,
          data: Tool.formData($form),
          type: Ajax.POST,
          dataType: Ajax.JSON
        }
      }
      this._ajaxUseful($this, config)
    })
  }

  // ----------------------------------------------------------------------
  //  普通ajax交互
  // ----------------------------------------------------------------------
  ajax() {
    $(Selector.AJAX, this._element).on(Event.CLICK_AJAX, (event) => {
      if (event) {
        event.preventDefault()
      }
      const $this = $(event.currentTarget)
      $this.blur()
      const data = $this.data()
      const config = {
        ...data,
        ...{
          url: $this.attr('href') || $this.data('url'),
          data,
          type: Ajax.POST,
          dataType: Ajax.JSON
        }
      }
      this._ajaxUseful($this, config)
    })
  }

  // ----------------------------------------------------------------------
  //  ajax 返回html
  // ----------------------------------------------------------------------
  html() {
    $(Selector.HTML, this._element).on(Event.CLICK_AJAX, (event) => {
      if (event) {
        event.preventDefault()
      }
      const $this = $(event.currentTarget)
      $this.blur()

      const listElement = $this.closest(Selector.NAV_LIST_GROUP)[0]
      const activeElements = listElement && (listElement.nodeName === 'UL' || listElement.nodeName === 'OL')
        ? $(listElement).find(Selector.ACTIVE_UL)
        : $(listElement).children(Selector.ACTIVE)
      if (activeElements) {
        $(activeElements).removeClass(ClassName.ACTIVE)
      }
      $this.addClass(ClassName.ACTIVE)

      const data = $this.data()
      const config = {
        ...data,
        ...{
          url: $this.attr('href') || $this.data('url'),
          data,
          type: Ajax.POST,
          dataType: Ajax.HTML
        }
      }
      this._ajaxUseful($this, config)
    })
  }

  // ----------------------------------------------------------------------
  //  分页器js处理
  // ----------------------------------------------------------------------
  page() {
    $(Selector.PAGE, this._element).each((index, element) => {
      const $main = $(element).closest(ClassName.QUERY_MAIN)
      const op = $main.data(DataKey.QUERY) || {
        data: {}
      }
      $(element).find(ClassName.PAGE_LINK).on(Event.CHANGE_DATA_API, (event) => {
        if (event) {
          event.preventDefault()
        }
        const $this = $(event.target)
        const pageNum = $this.data('pagenum')
        op.data.pageNum = pageNum
        Ajax.send(op)
      })
    })
  }

  // ----------------------------------------------------------------------
  //  tree js处理
  // ----------------------------------------------------------------------
  tree() {
    $(Selector.TREE, this._element).each((_index, element) => {
      const tree = new Tree(element)
      $(element).data(DataKey.TREE, tree)
    })
  }

  // ----------------------------------------------------------------------
  //  file js处理
  // ----------------------------------------------------------------------
  file() {
    $(Selector.FILE, this._element).each((_index, element) => {
      const file = new Upload(element)
      $(element).data(DataKey.FILE, file)
    })
  }

  // ----------------------------------------------------------------------
  //  富文本编辑器 js处理
  // ----------------------------------------------------------------------
  editor() {
    $(Selector.EDITOR, this._element).each((index, element) => {
      const editor = new Editor(element)
      $(element).data(DataKey.EDITOR, editor)
    })
  }

  // ----------------------------------------------------------------------
  //  ajax默认success方法
  // ----------------------------------------------------------------------
  _suc($this, config, callback) {
    if (config.dataType === Ajax.HTML) {
      return function (result) {
        if (!config.target) {
          return
        }
        const $target = ($this.closest(ClassName.QUERY_MAIN) || document).find(`${config.target}:first`)
        $target.html(result)
        $target.data(DATA_KEY, new InitUI($target.html(result)[0]))
        if (callback && typeof callback === 'function') {
          callback($this, config)
        }
      }
    }
    return function (result) {
      if (!result || typeof result !== 'object') {
        return Toast.err('未知错误')
      }
      // 后台返回参数 result
      const flag = result.result

      if (callback && typeof callback === 'function') {
        callback($this, config)
      } else if (flag) {
        if ($('#modal').length > 0) {
          $('#modal').modal('hide')
        }
        if ($('#query').length > 0) {
          $('#query').trigger('click')
        }
      }
      return Toast[flag ? 'suc' : 'err'](result.message)
    }
  }

  // ----------------------------------------------------------------------
  //  通用处理Customer中的事件
  //  事件顺序:[chk , cus, bef ,suc]
  // ----------------------------------------------------------------------
  _ajaxUseful($this, config) {
    const chk = Tool.eval(config[Customer.CHECK])
    if (typeof chk === 'function') {
      const flag = chk($this, config.data)
      if (typeof flag === 'boolean' && !flag) {
        return
      }
    }
    // 自定义函数式  用于封装数据
    const cus = Tool.eval(config[Customer.CUSTOM])
    if (cus && typeof cus === 'object' && typeof cus.fuc === 'function') {
      const rescus = cus.fuc.call($this[0], ...cus.args)
      if (rescus && typeof rescus === 'object') {
        config.data = {
          ...config.data,
          ...rescus
        }
      } else if (typeof rescus === 'boolean' && !rescus) {
        return
      } else {
        return
      }
    }

    const warn = config[ClassName.WARN]
    if (warn) {
      const confirm = new Confirm(warn)
      confirm.ok(() => this._ajaxUsefulMain($this, config)).show()
    } else {
      this._ajaxUsefulMain($this, config)
    }
  }

  // ----------------------------------------------------------------------
  //  通用处理Customer中的事件
  //  事件顺序:[chk , cus, bef ,suc]
  // ----------------------------------------------------------------------
  _ajaxUsefulMain($this, config) {
    const bef = Tool.eval(config[Customer.BEFORE])
    if (typeof bef === 'function') {
      const obj = bef($this, config.data)
      if (!bef) {
        return
      }
      config.data = {
        ...config.data,
        ...typeof obj === 'object' && obj ? obj : {}
      }
    }
    const suc = Tool.eval(config[Customer.SUCCESS])
    config.success = this._suc($this, config, suc)
    Ajax.send(config)
  }

  start() {
    if (this._callback && typeof this._callback === 'function') {
      this._callback()
    }
  }

  initFuc() {
    return function () {
      const ele = $(this._element).find(`[${Selector.INIT}]:first`)
      if (ele.length === 0) {
        return
      }
      const init = Tool.eval(ele.attr(Selector.INIT))
      if (init && typeof init === 'function') {
        init(this._element)
      }
    }
  }

  // ----------------------------------------------------------------------
  //  默认启动方法init()
  // ----------------------------------------------------------------------
  static _init(callback, start) {
    return this.each(function () {
      $(this).data(DATA_KEY, new InitUI(this, callback, start))
    })
  }
}


/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 */
$.fn[NAME] = InitUI._init
$.fn[NAME].Constructor = InitUI
$.fn[NAME].noConflict = () => {
  $.fn[NAME] = JQUERY_NO_CONFLICT
  return InitUI._init
}
export default InitUI
