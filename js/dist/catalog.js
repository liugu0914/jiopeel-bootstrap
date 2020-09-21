/*!
  * Bootstrap catalog.js v4.3.1 (http://zhikezhui.com/)
  * Copyright 2011-2020 lyc
  */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Catalog = factory());
}(this, function () { 'use strict';

  /* eslint-disable consistent-return */

  /* eslint-disable no-undef */

  /* eslint-disable no-magic-numbers */

  /* eslint-disable guard-for-in */
  var Catalog = {
    rowTemplate: "<div class=\"row\">\n                <div class=\"col-12\">\n                    <div class=\"card d-block\">\n                        <a href=\"/p/{{id}}\">{{img}}</a>\n                        <div class=\"card-body bg-mode\">\n                             <a href=\"/p/{{id}}\"><h5 class=\"display-7 mb-2\">{{title}}</h5> </a>\n                            <p class=\"card-text\">{{content}}</p>\n                            <div class=\"row\">\n                                <div class=\"col-sm-7\">\n                                    {{label}}\n                                </div>\n                                <div class=\"col-sm-5\">\n                                    <div class=\"pt-1 pb-1\">\n                                        <p class=\"card-text text-sm-left text-md-right\">\n                                            <small class=\"text-muted mr-1\">\u5206\u7C7B: <span class=\"badge badge-info-lighten\">{{sortname}}</span></small>\n                                            <small class=\"text-muted\">|</small>\n                                            <small class=\"text-muted ml-1\"><i class=\"cs cs-shijian font-weight-bolder\"></i> {{time}}</small>\n                                        </p>\n                                    </div>\n                                </div>\n                            </div>\n                        </div>\n                    </div>\n                </div>\n            </div>",
    imgTemplate: '<div class="card-bg-img card-img-top h-img-show" style="background-image: url(\'{{cover}}"></div>',
    labelTemplate: '<div class="pt-1 pb-1"><i class="cs cs-biaoqian"></i>{{tags}}</div>',
    tagsTemplate: '<span class="badge badge-warning-lighten mr-1">{{tagName}}</span>',
    init: function init() {
      Catalog.loadData();
      $(window).on('resize scroll', function () {
        var windowHeight = $(window).height(); // 当前窗口的高度

        var scrollTop = $(window).scrollTop(); // 当前滚动条从上往下滚动的距离

        var docHeight = $(document).height(); // 当前文档的高度
        // 当 滚动条距底部的距离 + 滚动条滚动的距离 >= 文档的高度 - 窗口的高度
        // 换句话说：（滚动条滚动的距离 + 窗口的高度 = 文档的高度）  这个是基本的公式

        if (scrollTop + windowHeight >= docHeight) {
          if ($('#catalog-data-loading').length !== 0) {
            return;
          }

          Catalog.addLoading();
          setTimeout(Catalog.loadData, 200);
        }
      });
    },
    addLoading: function addLoading(text) {
      text = text ? text : '加载中&hellip;';
      var loadingTemplate = "<div id=\"catalog-data-loading\" class=\"text-muted text-center font-13\">" + text + "</div>";
      var $data = $('#catalog-data');
      var $loading = $('#catalog-data-loading');

      if ($loading.length === 0) {
        $(loadingTemplate).appendTo($data).offset();
      }
    },
    endLoading: function endLoading(has, text) {
      var $loading = $('#catalog-data-loading');

      if (has) {
        $loading.remove();
      } else {
        if ($loading.length === 0) {
          Catalog.addLoading(text);
        }

        $loading.text(text);
      }
    },
    loadData: function loadData() {
      var data = $('#catalog-data').data();
      var pageNum = data.pageNum;
      var pages = data.pages;

      if (pageNum !== 0 && !pageNum) {
        pageNum = -1;
      }

      if (pages && pageNum === pages - 1) {
        return Catalog.endLoading(false, '———— The End ————');
      }

      pageNum += 1;
      var menuItem = $('#pc-menu').find('li.menu-item.active:first');
      var alias = menuItem.data('alias'); // 基础菜单的别名

      var sortid = $('#sortid').val() || '';
      var labelid = $('#labelid').val() || '';
      var search = $('#search').val() || '';
      Ajax.post('/loadCatalog', {
        pageNum: pageNum,
        alias: alias,
        sortid: sortid,
        labelid: labelid,
        search: search
      }, Catalog.InitCatalog);
    },
    InitCatalog: function InitCatalog(base) {
      // 属于服务内部错误
      if (!base || typeof base !== 'object' || !base.data) {
        return Catalog.endLoading(false, '暂无更多');
      } // 处理数据结构


      var page = base.data; // 数据错误

      if (!page || !Tool.isJSON(page) || !page.result || !Tool.isJSON(page.result) || page.result.length === 0) {
        return Catalog.endLoading(false, '暂无更多');
      }

      Catalog.endLoading(true);
      var list = page.result;
      var $data = $('#catalog-data');

      for (var i in list) {
        var row = Catalog.rowTemplate;
        var item = list[i];
        var time = item.ctime; // 创建时间

        if (moment) {
          var nowyear = moment().year();
          time = moment(time, 'YYYY-MM-DD HH:mm:ss');

          if (nowyear === time.year()) {
            time = time.format('MM-DD HH:mm');
          }
        }

        row = row.replace(new RegExp('{{id}}', 'g'), item.id).replace(new RegExp('{{title}}', 'g'), item.title).replace(new RegExp('{{content}}', 'g'), item.content).replace(new RegExp('{{sortname}}', 'g'), item.sortname).replace(new RegExp('{{time}}', 'g'), time);
        var cover = item.cover; // 图片

        var img = '';

        if (cover) {
          img = Catalog.imgTemplate;
          img = img.replace(new RegExp('{{cover}}', 'g'), cover);
        }

        row = row.replace(new RegExp('{{img}}', 'g'), img);
        var commons = item.commons; // 标签

        var label = '';

        if (commons && commons.length > 0) {
          label = Catalog.labelTemplate;
          var tags = '';

          for (var z in commons) {
            var tag = Catalog.tagsTemplate;
            tag = tag.replace(new RegExp('{{tagName}}', 'g'), commons[z].name);
            tags += tag;
          }

          label = label.replace(new RegExp('{{tags}}', 'g'), tags);
        }

        row = row.replace(new RegExp('{{label}}', 'g'), label);
        $(row).appendTo($data).initUI();
      }

      delete page.result;
      page.pageNum = page.pageNum > 0 ? page.pageNum - 1 : 0;
      $data.data(page);

      if ($('#ContentTotal').length !== 0) {
        $('#ContentTotal').text(page.total || 0);
      }
    }
  };

  return Catalog;

}));
//# sourceMappingURL=catalog.js.map
