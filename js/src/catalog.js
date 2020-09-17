/* eslint-disable consistent-return */

/* eslint-disable no-undef */
/* eslint-disable no-magic-numbers */
/* eslint-disable guard-for-in */
const Catalog = {
  rowTemplate : `<div class="row">
                <div class="col-12">
                    <div class="card d-block">
                        <a href="/p/{{id}}">{{img}}</a>
                        <div class="card-body bg-mode">
                             <a href="/p/{{id}}"><h5 class="display-7 mb-2">{{title}}</h5> </a>
                            <p class="card-text">{{content}}</p>
                            <div class="row">
                                <div class="col-sm-7">
                                    {{label}}
                                </div>
                                <div class="col-sm-5">
                                    <div class="pt-1 pb-1">
                                        <p class="card-text text-sm-left text-md-right">
                                            <small class="text-muted mr-1">分类: <span class="badge badge-info-lighten">{{sortname}}</span></small>
                                            <small class="text-muted">|</small>
                                            <small class="text-muted ml-1"><i class="cs cs-shijian font-weight-bolder"></i> {{time}}</small>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`,
  imgTemplate :'<div class="card-bg-img card-img-top h-img-show" style="background-image: url(\'{{cover}}"></div>',
  labelTemplate :'<div class="pt-1 pb-1"><i class="cs cs-biaoqian"></i>{{tags}}</div>',
  tagsTemplate :'<span class="badge badge-warning-lighten mr-1">{{tagName}}</span>',
  init() {
    Catalog.loadData()
    $(window).on('resize scroll', () => {
      const windowHeight = $(window).height()// 当前窗口的高度
      const scrollTop = $(window).scrollTop()// 当前滚动条从上往下滚动的距离
      const docHeight = $(document).height() // 当前文档的高度
      // 当 滚动条距底部的距离 + 滚动条滚动的距离 >= 文档的高度 - 窗口的高度
      // 换句话说：（滚动条滚动的距离 + 窗口的高度 = 文档的高度）  这个是基本的公式
      if (scrollTop + windowHeight >= docHeight) {
        if ($('#catalog-data-loading').length !== 0) {
          return
        }
        Catalog.addLoading()
        setTimeout(Catalog.loadData, 200)
      }
    })
  },
  addLoading(text) {
    text = text ? text : '加载中&hellip;'
    const loadingTemplate = `<div id="catalog-data-loading" class="text-muted text-center font-13">${text}</div>`
    const $data = $('#catalog-data')
    const $loading = $('#catalog-data-loading')
    if ($loading.length === 0) {
      $(loadingTemplate).appendTo($data).offset()
    }
  },
  endLoading(has, text) {
    const $loading = $('#catalog-data-loading')
    if (has) {
      $loading.remove()
    } else {
      if ($loading.length === 0) {
        Catalog.addLoading(text)
      }
      $loading.text(text)
    }
  },
  loadData() {
    const data = $('#catalog-data').data()
    let pageNum = data.pageNum
    const pages = data.pages
    if (pageNum !== 0 && !pageNum) {
      pageNum = -1
    }
    if (pages && pageNum === pages - 1) {
      return Catalog.endLoading(false, '———— The End ————')
    }
    pageNum += 1
    const menuItem = $('#pc-menu').find('li.menu-item.active:first')
    const alias = menuItem.data('alias') // 基础菜单的别名
    const sortid = $('#sortid').val() || ''
    const labelid = $('#labelid').val() || ''
    const search = $('#search').val() || ''
    Ajax.post('/loadCatalog',
      {
        pageNum,
        alias,
        sortid,
        labelid,
        search
      },
      Catalog.InitCatalog)
  },
  InitCatalog(base) {
    // 属于服务内部错误
    if (!base || typeof base !== 'object' || !base.data) {
      return Catalog.endLoading(false, '暂无更多')
    }
    // 处理数据结构
    const page = base.data
    // 数据错误
    if (!page || !Tool.isJSON(page) || !page.result || !Tool.isJSON(page.result) || page.result.length === 0) {
      return Catalog.endLoading(false, '暂无更多')
    }
    Catalog.endLoading(true)
    const list = page.result
    const $data = $('#catalog-data')
    for (const i in list) {
      let row = Catalog.rowTemplate
      const item = list[i]
      let time = item.ctime // 创建时间
      if (moment) {
        const nowyear = moment().year()
        time = moment(time, 'YYYY-MM-DD HH:mm:ss')
        if (nowyear === time.year()) {
          time = time.format('MM-DD HH:mm')
        }
      }
      row = row.replace(new RegExp('{{id}}', 'g'), item.id)
        .replace(new RegExp('{{title}}', 'g'), item.title)
        .replace(new RegExp('{{content}}', 'g'), item.content)
        .replace(new RegExp('{{sortname}}', 'g'), item.sortname)
        .replace(new RegExp('{{time}}', 'g'), time)
      const cover = item.cover // 图片
      let img = ''
      if (cover) {
        img = Catalog.imgTemplate
        img = img.replace(new RegExp('{{cover}}', 'g'), cover)
      }
      row = row.replace(new RegExp('{{img}}', 'g'), img)
      const commons = item.commons // 标签
      let label = ''
      if (commons && commons.length > 0) {
        label = Catalog.labelTemplate
        let tags = ''
        for (const z in commons) {
          let tag = Catalog.tagsTemplate
          tag = tag.replace(new RegExp('{{tagName}}', 'g'), commons[z].name)
          tags += tag
        }
        label = label.replace(new RegExp('{{tags}}', 'g'), tags)
      }
      row = row.replace(new RegExp('{{label}}', 'g'), label)
      $(row).appendTo($data).initUI()
    }
    delete page.result
    page.pageNum = page.pageNum > 0 ? page.pageNum - 1 : 0
    $data.data(page)
    if ($('#ContentTotal').length !== 0) {
      $('#ContentTotal').text(page.total || 0)
    }
  }
}

export default Catalog
