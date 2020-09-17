/*!
  * Bootstrap comments.js v4.3.1 (http://jiopeel.com/)
  * Copyright 2011-2020 lyc
  */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Comments = factory());
}(this, function () { 'use strict';

  /* eslint-disable no-script-url */

  /* eslint-disable complexity */

  /* eslint-disable consistent-return */

  /* eslint-disable no-undef */

  /* eslint-disable no-magic-numbers */

  /* eslint-disable guard-for-in */
  var Comments = {
    $comment: null,
    $author: null,
    $contact: null,
    $website: null,
    replayTemplate: "<span id=\"comments-main-replay\" class=\"comments-main-replay\">\n  <span class=\"media-info-span\">\n      \u56DE\u590D\n          <i class=\"cs cs-xiangyou1\"></i>\n      </span>\n  <span class=\"media-info-span\">\n          <a class=\"media-body-img\" href=\"#\">\n              <img src=\"{{img}}\" class=\"w-32 rounded-circle\">\n          </a>\n      </span>\n  <span class=\"media-info-span\">\n          <a href=\"{{website}}\">{{author}}</a>\n      </span>\n  <span  class=\"btn btn-sm btn-outline-dark float-right pointer pl-1 pr-1\" onclick=\"Comments.cancelRelay()\">\n     \u53D6\u6D88\u56DE\u590D\n  </span>\n</span>",
    mediaFisrtTemplate: "<div class=\"media media-first pt-3 pb-3\">\n<a class=\"pr-1 pr-md-2\" href=\"javascript:void(0)\">\n    <img src=\"/img/user.png\" class=\"w-32 rounded-circle\" alt=\"Generic placeholder image\">\n</a>\n<div class=\"media-body\">\n    <div class=\"media-content\">\n        <h5 class=\"mt-0 mb-1\">\n            <a href=\"{{website}}\" >{{author}}</a>\n            <span class=\"media-info-span float-right font-15\">\n            <a href=\"#\" class=\"comments-like {{active}}\">\n                <i class=\"cs cs-dianzan\"></i>\n                <span>{{love}}</span>\n            </a>\n        </span>\n        </h5>\n        <p>{{comment}}</p>\n        <div class=\"media-info\">\n            <small class=\"text-muted\">\n                <span class=\"media-info-span\">{{ctime}}</span>\n                <span class=\"media-info-span float-right\">\n                <a class=\"comments-replay\"  href=\"#\">\n                    <i class=\"cs cs-pinglun\"></i>\n                    \u56DE\u590D\n                </a>\n            </span>\n            </small>\n        </div>\n    </div>\n</div>\n</div>",
    mediaReplayTemplate: "<div class=\"media mt-2\">\n        <a class=\"pr-1\" href=\"javascript:void(0)\">\n            <img src=\"/img/user.png\" class=\"avatar-xs rounded-circle\" alt=\"Generic placeholder image\">\n        </a>\n        <div class=\"media-body\">\n            <div class=\"media-content\">\n            <h5 class=\"mt-0 mb-1\">\n                <span class=\"media-info-span\">\n              <a href=\"{{website}}\" >\n                {{author}}\n              </a>\n                {{superauthorTemplate}}\n                <span class=\"media-info-span float-right font-15\">\n                    <a href=\"#\"  class=\"comments-like {{active}}\"><i class=\"cs cs-dianzan\"></i> <span>{{love}}</span></a>\n                </span>\n            </h5>\n            <p>{{comment}}</p>\n            </div>\n            <div class=\"media-info\">\n                <small class=\"text-muted\">\n                    <span class=\"media-info-span\">{{ctime}}</span>\n                    <span class=\"media-info-span float-right\">\n                        <a  href=\"#\" class=\"comments-replay\"> <i class=\"cs cs-pinglun\"></i> \u56DE\u590D</a>\n                    </span>\n                </small>\n            </div>\n        </div>\n    </div>",
    superTemplate: "</span>\n                <span class=\"media-info-span\">\n                <i class=\"cs cs-xiangyou1\"></i>\n            </span>\n            <span class=\"media-info-span\">\n                <a class=\"media-body-img\" href=\"javascript:void(0)\">\n                    <img src=\"/img/user.png\" class=\"avatar-xs rounded-circle\" alt=\"Generic placeholder image\">\n                </a>\n            </span>\n            <span class=\"media-info-span\">\n                <a href=\"{{superwebsite}}\" >\n                {{superauthor}}\n                </a>\n            </span>",
    Info: {
      prefix: 'jiopeel_comment_',
      author: 'jiopeel_comment_author',
      contact: 'jiopeel_comment_contact',
      website: 'jiopeel_comment_website',
      data: 'jiopeel_comment_data',
      like: 'jiopeel_comment_like',
      cookieDay: 15,
      dataDay: 0.5
    },
    init: function init() {
      Comments.$comment = $('#comment');
      Comments.$author = $('#author');
      Comments.$contact = $('#contact');
      Comments.$website = $('#website');
      var CommentData = Comments.getCommentCookie();
      var author = CommentData[Comments.Info.author.replace(Comments.Info.prefix, '')];
      var contact = CommentData[Comments.Info.contact.replace(Comments.Info.prefix, '')];
      var website = CommentData[Comments.Info.website.replace(Comments.Info.prefix, '')];

      if (author) {
        Comments.$author.val(author);
      }

      if (contact) {
        Comments.$contact.val(contact);
      }

      if (website) {
        Comments.$website.val(website);
      }

      Comments.loadComments();
      Comments.commentLike();
      Comments.relay();
      $(window).on('resize scroll', function () {
        var windowHeight = $(window).height(); // 当前窗口的高度

        var scrollTop = $(window).scrollTop(); // 当前滚动条从上往下滚动的距离

        var docHeight = $(document).height(); // 当前文档的高度
        // 当 滚动条距底部的距离 + 滚动条滚动的距离 >= 文档的高度 - 窗口的高度
        // 换句话说：（滚动条滚动的距离 + 窗口的高度 = 文档的高度）  这个是基本的公式

        var pensen = scrollTop / (docHeight - windowHeight) * 100;
        pensen = pensen.toFixed(0);

        if (pensen >= 100) {
          if ($('#comments-loading').length !== 0) {
            return;
          }

          Comments.addLoading();
          setTimeout(Comments.loadComments, 200);
        }
      });
    },
    chk: function chk() {
      var nullMsg = [];

      if (!Comments.$comment.val() || !Comments.$comment.val().trim()) {
        nullMsg.push('评论内容');
      }

      if (!Comments.$author.val() || !Comments.$author.val().trim()) {
        nullMsg.push('昵称');
      }

      if (!Comments.$contact.val() || !Comments.$contact.val().trim()) {
        nullMsg.push('Email/QQ');
      }

      if (nullMsg.length > 0) {
        Toast.err(nullMsg.join(',  ') + "\u4E0D\u80FD\u4E3A\u7A7A");
        return false;
      }

      var authorName = Comments.$author.val();

      if (authorName.length > 20) {
        Toast.err('昵称过长,不能大于20个字符');
        return false;
      }

      var contactVal = Comments.$contact.val();

      if (!Tool.chkEmail(contactVal) && !Tool.chkQQ(contactVal)) {
        Toast.err('Email/QQ格式不正确');
        return false;
      }

      var websiteVal = Comments.$website.val();

      if (websiteVal && websiteVal.trim() && !Tool.chkHttp(websiteVal)) {
        Toast.err('网站格式不正确,请以http(s)://开头');
        return false;
      }

      return true;
    },
    bef: function bef($this, data) {
      Ajax.setCookie(Comments.Info.author, data.author, Comments.Info.cookieDay);
      Ajax.setCookie(Comments.Info.contact, data.contact, Comments.Info.cookieDay);
      Ajax.setCookie(Comments.Info.website, data.website, Comments.Info.cookieDay); // 待审核的评论

      data.publishtime = moment ? moment().format('YYYY-MM-DD HH:mm') : new Date().getTime();
      Ajax.setCookie(Comments.Info.data, JSON.stringify(data), Comments.Info.dataDay);
      Comments.setLocalStorage(data);
      var menuItem = $('#pc-menu').find('li.menu-item.active:first');
      var style = menuItem.data('style') || 'content';
      var alias = menuItem.data('alias');
      data.contentid = $('#contentid').val() || '0';
      data.style = style;
      data.alias = alias;
      return data;
    },
    suc: function suc() {
      window.location.reload();
    },
    relay: function relay() {
      $(document).on('click', 'a.comments-replay', function (event) {
        if (event) {
          event.preventDefault();
        }

        $('#scroll_to_comments').trigger('click'); // 滑动到评论

        if ($('#comments-main-replay').length !== 0) {
          $('#comments-main-replay').remove();
        }

        var $body = $(this).closest('.media-first').find('.media-body:first');
        var $subbody = $(this).closest('.media-body');
        var data = $body.data('comment_data') || {};
        $('#topid').val(data.id); // 顶级评论id

        var subdata = $subbody.data('comment_data') || {};
        $('#superid').val(subdata.id); // 回复的id

        var $header = $('#comments-main-header');
        var temp = Comments.replayTemplate;
        temp = temp.replace(new RegExp('{{img}}', 'g'), '/img/user.png').replace(new RegExp('{{website}}', 'g'), subdata.website || 'javascript:void(0)').replace(new RegExp('{{author}}', 'g'), subdata.author || '外星人');
        $(temp).appendTo($header);
        setTimeout(function () {
          $('#comment').trigger('focus');
        }, 200);
      });
    },
    commentLike: function commentLike() {
      $(document).on('click', 'a.comments-like', function (event) {
        if (event) {
          event.preventDefault();
        }

        var $this = $(this);
        var data = $this.parents('.media-body').data('comment_data');

        if (!data || !data.id) {
          return;
        }

        var id = data.id;
        var StorageData = localStorage.getItem(Comments.Info.like);

        if (StorageData) {
          StorageData = JSON.parse(StorageData);

          if (StorageData.indexOf(id) > -1) {
            return Toast.warn('你已经点过赞了');
          }
        }

        Ajax.get('/CommentLike', {
          id: id
        }, function (base) {
          if (base.result && base.data) {
            var rd = base.data;
            $this.addClass('active').find('span').text(rd.love || 0);

            if (!StorageData) {
              localStorage.setItem(Comments.Info.like, JSON.stringify([id]));
            } else {
              StorageData.push(id);
              localStorage.setItem(Comments.Info.like, JSON.stringify(StorageData));
            }
          }
        });
      });
    },
    cancelRelay: function cancelRelay() {
      $('#topid').val('0'); // 顶级评论id

      $('#superid').val('0'); // 回复的id

      if ($('#comments-main-replay').length !== 0) {
        $('#comments-main-replay').remove();
      }
    },
    getCommentCookie: function getCommentCookie() {
      var data = {};
      data.author = Ajax.getCookie(Comments.Info.author);
      data.contact = Ajax.getCookie(Comments.Info.contact);
      data.website = Ajax.getCookie(Comments.Info.website);
      return data;
    },
    setLocalStorage: function setLocalStorage(data) {
      var StorageData = localStorage.getItem(Comments.Info.data);

      if (!StorageData) {
        localStorage.setItem(Comments.Info.data, JSON.stringify([data]));
      } else {
        StorageData = JSON.parse(StorageData);
        StorageData.push(data);
        localStorage.setItem(Comments.Info.data, JSON.stringify(StorageData));
      }
    },
    loadComments: function loadComments() {
      var data = $('#comments-data').data();
      var pageNum = data.pageNum;

      if (pageNum !== 0 && !pageNum) {
        pageNum = -1;
      }

      if (data.pages && pageNum === data.pages - 1) {
        return Comments.endLoading(false, '———— The End ————');
      }

      var contentid = $('#contentid').val() || '0';
      pageNum += 1;
      var menuItem = $('#pc-menu').find('li.menu-item.active:first');
      var style = menuItem.data('style') || 'content';
      var alias = menuItem.data('alias');
      Ajax.post('/loadComments', {
        contentid: contentid,
        pageNum: pageNum,
        style: style,
        alias: alias
      }, Comments.InitComments);
    },
    endLoading: function endLoading(hasComment, text) {
      var $commentsLoading = $('#comments-loading');

      if (hasComment) {
        $commentsLoading.remove();
      } else {
        if ($commentsLoading.length === 0) {
          Comments.addLoading(text);
        }

        $commentsLoading.text(text);
      }
    },
    addLoading: function addLoading(text) {
      text = text ? text : '评论加载中&hellip;';
      var loadingTemplate = "<div id=\"comments-loading\" class=\"text-muted text-center font-13\">" + text + "</div>";
      var $commentsData = $('#comments-data');
      var commentsLoading = $('#comments-loading');

      if (commentsLoading.length === 0) {
        $(loadingTemplate).appendTo($commentsData).offset();
      }
    },
    InitComments: function InitComments(base) {
      // 属于服务内部错误
      if (!base || typeof base !== 'object' || !base.data) {
        return Comments.endLoading(false, '暂无评论');
      } // 处理数据结构


      var page = base.data; // 数据错误

      if (!page || !Tool.isJSON(page) || !page.result || !Tool.isJSON(page.result) || page.result.length === 0) {
        return Comments.endLoading(false, '暂无评论');
      }

      Comments.endLoading(true);
      var list = page.result;
      var $commentsData = $('#comments-data');
      var StorageData = localStorage.getItem(Comments.Info.like);

      if (StorageData) {
        StorageData = JSON.parse(StorageData);
      }

      for (var i in list) {
        var temp = Comments.mediaFisrtTemplate;
        var item = list[i];
        var ctime = item.ctime;

        if (moment) {
          var nowyear = moment().year();
          ctime = moment(ctime, 'YYYY-MM-DD HH:mm:ss');

          if (nowyear === ctime.year()) {
            ctime = ctime.format('MM-DD HH:mm');
          }
        }

        var itemActive = '';

        if (StorageData && StorageData.indexOf(item.id) > -1) {
          itemActive = 'active';
        }

        temp = temp.replace(new RegExp('{{author}}', 'g'), item.author).replace(new RegExp('{{website}}', 'g'), item.website || 'javascript:void(0)').replace(new RegExp('{{active}}', 'g'), itemActive).replace(new RegExp('{{love}}', 'g'), item.love).replace(new RegExp('{{comment}}', 'g'), item.comment).replace(new RegExp('{{ctime}}', 'g'), ctime);
        var $temp = $(temp);
        var $mediaBody = $temp.find('.media-body:first');
        $mediaBody.data('comment_data', item);
        var replys = item.replys;

        if (replys) {
          for (var z in replys) {
            var replayTemp = Comments.mediaReplayTemplate;
            var superTemp = Comments.superTemplate;
            var reply = replys[z];
            var replyTime = reply.ctime;

            if (moment) {
              var cnowyear = moment().year();
              replyTime = moment(replyTime, 'YYYY-MM-DD HH:mm:ss');

              if (cnowyear === replyTime.year()) {
                replyTime = replyTime.format('MM-DD HH:mm');
              }
            }

            var replayActive = '';

            if (StorageData && StorageData.indexOf(reply.id) > -1) {
              replayActive = 'active';
            }

            replayTemp = replayTemp.replace(new RegExp('{{author}}', 'g'), reply.author).replace(new RegExp('{{website}}', 'g'), reply.website || 'javascript:void(0)').replace(new RegExp('{{active}}', 'g'), replayActive).replace(new RegExp('{{love}}', 'g'), reply.love).replace(new RegExp('{{comment}}', 'g'), reply.comment).replace(new RegExp('{{ctime}}', 'g'), replyTime);

            if (reply.topid !== '0' && reply.topid !== reply.superid) {
              superTemp = superTemp.replace(new RegExp('{{superauthor}}', 'g'), reply.superauthor || '外星人').replace(new RegExp('{{superwebsite}}', 'g'), reply.superwebsite || 'javascript:void(0)');
            } else {
              superTemp = '';
            }

            replayTemp = replayTemp.replace(new RegExp('{{superauthorTemplate}}', 'g'), superTemp);
            var $replayTemp = $(replayTemp).appendTo($mediaBody);
            $replayTemp.find('.media-body:first').data('comment_data', reply);
          }
        }

        $temp.appendTo($commentsData).initUI();
      }

      $('#comments-nums').text("(" + page.total + ")");
      delete page.result;
      page.pageNum = page.pageNum > 0 ? page.pageNum - 1 : 0;
      $commentsData.data(page);
    }
  };

  return Comments;

}));
//# sourceMappingURL=comments.js.map
