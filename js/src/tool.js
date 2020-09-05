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
      const value = array[index].value
      data[name] = data[name] ? [...$.isArray(data[name]) ? data[name] : [data[name]], value] : value
    }
    return data
  }

  // ----------------------------------------------------------------------
  // Object序列化
  // ----------------------------------------------------------------------
  static toSerialize(obj) {
    let serialize = ''
    if (!obj || !(obj instanceof Object)) {
      return serialize
    }
    for (const key in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) {
        continue
      }
      let data = obj[key]

      if (data instanceof Array) {
        for (const index in data) {
          if (!Object.prototype.hasOwnProperty.call(data, index)) {
            continue
          }
          let value = data[index]
          value = encodeURIComponent(value)
          serialize = serialize ? serialize.concat(`&${key}=${value}`) : `${key}=${value}`
        }
      } else if (typeof data === 'object') {
        continue
      } else {
        data = encodeURIComponent(data)
        serialize = serialize ? serialize.concat(`&${key}=${data}`) : `${key}=${data}`
      }
    }
    return serialize
  }

  // ----------------------------------------------------------------------
  // 数组数据转为Object
  // ----------------------------------------------------------------------
  static toObject(target, ...needs) {
    if (!target) {
      return {}
    }
    if (!(target instanceof Array)) {
      return target
    }
    const data = {}
    let flag = false
    for (const index in target) {
      if (!Object.prototype.hasOwnProperty.call(target, index)) {
        continue
      }
      const targetData = target[index]
      if (typeof targetData !== 'object') {
        flag = true
        break
      }
      for (const key in targetData) {
        if (!Object.prototype.hasOwnProperty.call(targetData, key)) {
          continue
        }
        if (needs && needs.length > 0 && !needs.includes(key)) {
          continue
        }
        const value = targetData[key]
        data[key] = data[key] ? [...$.isArray(data[key]) ? data[key] : [data[key]], value] : value
      }
    }
    return flag ? target : data
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
    const regval = value.match(/\(.*\)/gi)

    if (regval && regval instanceof Array && regval.length > 0) {
      const JSON = window.JSON
      const argstr = regval.pop()
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
      const attrs = $.map($chks, (element) => $(element).data(dataName))
      data[dataName] = attrs.join(',')
    }
    return data
  }

  // ----------------------------------------------------------------------
  //  ztree 简单数据 转 子孙节点数据
  // ----------------------------------------------------------------------
  static rebliud(sNodes, key, parentKey, childKey) {
    if (!key) {
      key = 'id'
    }
    if (!parentKey) {
      parentKey = 'pid'
    }
    if (!childKey) {
      childKey = 'children'
    }
    const result = []
    const tmpMap = {}

    // 先把数组整理成map的形式
    for (let i = 0, l = sNodes.length; i < l; i++) {
      // key为 对象的"id"的值， value就是就该对象
      tmpMap[sNodes[i][key]] = sNodes[i]
    }

    // 遍历，组织成子孙节点
    for (let i = 0, l = sNodes.length; i < l; i++) {
      // 查找当前节点的父节点是否存在，如果存在就把当前节点放入到父节点的子孙列表中
      if (tmpMap[sNodes[i][parentKey]] && sNodes[i][key] !== sNodes[i][parentKey]) {
        if (!tmpMap[sNodes[i][parentKey]][childKey]) {
          tmpMap[sNodes[i][parentKey]][childKey] = []
        }
        tmpMap[sNodes[i][parentKey]][childKey].push(sNodes[i])
      } else {
        // 如果不存在就直接放入到一个新的列表中
        result.push(sNodes[i])
      }
    }
    return result
  }
}

export default Tool
