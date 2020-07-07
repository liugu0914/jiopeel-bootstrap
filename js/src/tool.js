import $ from 'jquery'
import Toast from './toast'

/**
 * ------------------------------------------------------------------------
 *  工具类
 *  @author lyc
 *  @date 2020年06月04日17:48:50
 * ------------------------------------------------------------------------
 */
class Tool {
  // ----------------------------------------------------------------------
  // 获取form数据转为Object
  // $form 为form的JQuery对象
  // ----------------------------------------------------------------------
  static formData($form) {
    if (!$form || $form.length === 0 || !$ || !$.fn) {
      return {}
    }
    const array = $form.serializeArray()
    const data = {}
    for (const index in array) {
      if (!Object.prototype.hasOwnProperty.call(array, index)) {
        continue
      }
      const name = array[index].name
      const value  = array[index].value || ''
      data[name] = data[name] ? [value,
        ...$.isArray(data[name]) ? data[name] : [data[name]]] : value
    }
    return data
  }
  // ----------------------------------------------------------------------
  // 字符串转function
  // ----------------------------------------------------------------------
  static eval(value) {
    let args
    let fuc
    if (!value) {
      return fuc
    }
    const regval =  value.match(/\(.*\)/gi)

    if (regval && regval instanceof Array && regval.length > 0) {
      const JSON = window.JSON
      const argstr =  regval.pop()
      value = value.replace(argstr, '')
      args = argstr.replace(/\(|\)/g, '').split(';')
      args = args.filter((arg) => arg || arg === 0).map((arg) => JSON.parse(arg.replace(/'/g, '"')))
    }
    try {
      // eslint-disable-next-line no-new-func
      fuc = new Function(`return ${value}`)()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(`the value [${value}] is not function`)
    }
    return args ? {
      args,
      fuc
    } : fuc
  }

  // ----------------------------------------------------------------------
  // 判断是否为JSON
  // ----------------------------------------------------------------------
  static isJSON(value) {
    if (!window.JSON || Object.prototype.toString.call(window.JSON) !== '[object JSON]') {
      throw new ReferenceError('JSON is not exist in window')
    }
    const JSON = window.JSON
    value = typeof value === 'string' ? value : JSON.stringify(value)
    try {
      value = Object.prototype.toString.call(JSON.parse(value))
      if (value === '[object Object]' || value === '[object Array]') {
        return true
      }
      return false
    } catch (e) {
      return false
    }
  }

  // ----------------------------------------------------------------------
  //  获取选中的项转为Object
  //  dataName可为 'id' 或 ['id','name']
  // ----------------------------------------------------------------------
  static checkedData(dataName, one) {
    const data = {}
    const $chks = $(this).closest('.query-data').find('.chk:checked')
    if (!one && (!$chks || $chks.length === 0)) {
      Toast.warn('请选择之后进行操作')
      return false
    }
    if (one && (!$chks || $chks.length !== 1)) {
      Toast.warn('请选择一项之后进行操作')
      return false
    }
    if (!dataName) {
      dataName = 'id'
    }
    if ($.isArray(dataName)) {
      for (const index in dataName) {
        if (!Object.prototype.hasOwnProperty.call(dataName, index)) {
          continue
        }
        const name = dataName[index]
        if (typeof name !== 'string') {
          continue
        }
        const attrs = $.map($chks, (element) => $(element).data(name))
        data[name] = attrs.join(',')
      }
    } else if (typeof dataName === 'string') {
      const attrs =  $.map($chks, (element) => $(element).data(dataName))
      data[dataName] = attrs.join(',')
    }
    return data
  }
}

export default Tool
