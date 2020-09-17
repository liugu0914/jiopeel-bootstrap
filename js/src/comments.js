/* eslint-disable no-script-url */
/* eslint-disable complexity */
/* eslint-disable consistent-return */
/* eslint-disable no-undef */
/* eslint-disable no-magic-numbers */
/* eslint-disable guard-for-in */
const Comments = {
  $comment: null,
  $author: null,
  $contact: null,
  $website: null,
  replayTemplate : `<span id="comments-main-replay" class="comments-main-replay">
  <span class="media-info-span">
      回复
          <i class="cs cs-xiangyou1"></i>
      </span>
  <span class="media-info-span">
          <a class="media-body-img" href="#">
              <img src="{{img}}" class="w-32 rounded-circle">
          </a>
      </span>
  <span class="media-info-span">
          <a href="{{website}}">{{author}}</a>
      </span>
  <span  class="btn btn-sm btn-outline-dark float-right pointer pl-1 pr-1" onclick="Comments.cancelRelay()">
     取消回复
  </span>
</span>`,
  mediaFisrtTemplate : `<div class="media media-first pt-3 pb-3">
<a class="pr-1 pr-md-2" href="javascript:void(0)">
    <img src="/img/user.png" class="w-32 rounded-circle" alt="Generic placeholder image">
</a>
<div class="media-body">
    <div class="media-content">
        <h5 class="mt-0 mb-1">
            <a href="{{website}}" >{{author}}</a>
            <span class="media-info-span float-right font-15">
            <a href="#" class="comments-like {{active}}">
                <i class="cs cs-dianzan"></i>
                <span>{{love}}</span>
            </a>
        </span>
        </h5>
        <p>{{comment}}</p>
        <div class="media-info">
            <small class="text-muted">
                <span class="media-info-span">{{ctime}}</span>
                <span class="media-info-span float-right">
                <a class="comments-replay"  href="#">
                    <i class="cs cs-pinglun"></i>
                    回复
                </a>
            </span>
            </small>
        </div>
    </div>
</div>
</div>`,
  mediaReplayTemplate : `<div class="media mt-2">
        <a class="pr-1" href="javascript:void(0)">
            <img src="/img/user.png" class="avatar-xs rounded-circle" alt="Generic placeholder image">
        </a>
        <div class="media-body">
            <div class="media-content">
            <h5 class="mt-0 mb-1">
                <span class="media-info-span">
              <a href="{{website}}" >
                {{author}}
              </a>
                {{superauthorTemplate}}
                <span class="media-info-span float-right font-15">
                    <a href="#"  class="comments-like {{active}}"><i class="cs cs-dianzan"></i> <span>{{love}}</span></a>
                </span>
            </h5>
            <p>{{comment}}</p>
            </div>
            <div class="media-info">
                <small class="text-muted">
                    <span class="media-info-span">{{ctime}}</span>
                    <span class="media-info-span float-right">
                        <a  href="#" class="comments-replay"> <i class="cs cs-pinglun"></i> 回复</a>
                    </span>
                </small>
            </div>
        </div>
    </div>`,
  superTemplate : `</span>
                <span class="media-info-span">
                <i class="cs cs-xiangyou1"></i>
            </span>
            <span class="media-info-span">
                <a class="media-body-img" href="javascript:void(0)">
                    <img src="/img/user.png" class="avatar-xs rounded-circle" alt="Generic placeholder image">
                </a>
            </span>
            <span class="media-info-span">
                <a href="{{superwebsite}}" >
                {{superauthor}}
                </a>
            </span>`,
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
  init() {
    Comments.$comment = $('#comment')
    Comments.$author = $('#author')
    Comments.$contact = $('#contact')
    Comments.$website = $('#website')
    const CommentData = Comments.getCommentCookie()
    const author = CommentData[Comments.Info.author.replace(Comments.Info.prefix, '')]
    const contact = CommentData[Comments.Info.contact.replace(Comments.Info.prefix, '')]
    const website = CommentData[Comments.Info.website.replace(Comments.Info.prefix, '')]
    if (author) {
      Comments.$author.val(author)
    }
    if (contact) {
      Comments.$contact.val(contact)
    }
    if (website) {
      Comments.$website.val(website)
    }
    Comments.loadComments()
    Comments.commentLike()
    Comments.relay()
    $(window).on('resize scroll', () => {
      const windowHeight = $(window).height()// 当前窗口的高度
      const scrollTop = $(window).scrollTop()// 当前滚动条从上往下滚动的距离
      const docHeight = $(document).height() // 当前文档的高度
      // 当 滚动条距底部的距离 + 滚动条滚动的距离 >= 文档的高度 - 窗口的高度
      // 换句话说：（滚动条滚动的距离 + 窗口的高度 = 文档的高度）  这个是基本的公式
      let pensen = scrollTop / (docHeight - windowHeight) * 100
      pensen = pensen.toFixed(0)
      if (pensen >= 100) {
        if ($('#comments-loading').length !== 0) {
          return
        }
        Comments.addLoading()
        setTimeout(Comments.loadComments, 200)
      }
    })
  },
  chk() {
    const nullMsg = []
    if (!Comments.$comment.val() || !Comments.$comment.val().trim()) {
      nullMsg.push('评论内容')
    }
    if (!Comments.$author.val() || !Comments.$author.val().trim()) {
      nullMsg.push('昵称')
    }
    if (!Comments.$contact.val() || !Comments.$contact.val().trim()) {
      nullMsg.push('Email/QQ')
    }
    if (nullMsg.length > 0) {
      Toast.err(`${nullMsg.join(',  ')}不能为空`)
      return false
    }
    const authorName = Comments.$author.val()
    if (authorName.length > 20) {
      Toast.err('昵称过长,不能大于20个字符')
      return false
    }
    const contactVal = Comments.$contact.val()
    if (!Tool.chkEmail(contactVal) && !Tool.chkQQ(contactVal)) {
      Toast.err('Email/QQ格式不正确')
      return false
    }
    const websiteVal = Comments.$website.val()
    if (websiteVal && websiteVal.trim() && !Tool.chkHttp(websiteVal)) {
      Toast.err('网站格式不正确,请以http(s)://开头')
      return false
    }
    return true
  },
  bef($this, data) {
    Ajax.setCookie(Comments.Info.author, data.author, Comments.Info.cookieDay)
    Ajax.setCookie(Comments.Info.contact, data.contact, Comments.Info.cookieDay)
    Ajax.setCookie(Comments.Info.website, data.website, Comments.Info.cookieDay)
    // 待审核的评论
    data.publishtime = moment ? moment().format('YYYY-MM-DD HH:mm') : new Date().getTime()
    Ajax.setCookie(Comments.Info.data, JSON.stringify(data), Comments.Info.dataDay)
    Comments.setLocalStorage(data)
    const menuItem = $('#pc-menu').find('li.menu-item.active:first')
    const style = menuItem.data('style') || 'content'
    const alias = menuItem.data('alias')
    data.contentid = $('#contentid').val() || '0'
    data.style = style
    data.alias = alias
    return data
  },
  suc() {
    window.location.reload()
  },
  relay() {
    $(document).on('click', 'a.comments-replay', function (event) {
      if (event) {
        event.preventDefault()
      }
      $('#scroll_to_comments').trigger('click')// 滑动到评论
      if ($('#comments-main-replay').length !== 0) {
        $('#comments-main-replay').remove()
      }
      const $body = $(this).closest('.media-first').find('.media-body:first')
      const $subbody = $(this).closest('.media-body')
      const data = $body.data('comment_data') || {}
      $('#topid').val(data.id)// 顶级评论id
      const subdata = $subbody.data('comment_data') || {}
      $('#superid').val(subdata.id)// 回复的id

      const $header = $('#comments-main-header')
      let temp = Comments.replayTemplate
      temp = temp.replace(new RegExp('{{img}}', 'g'), '/img/user.png')
        .replace(new RegExp('{{website}}', 'g'), subdata.website || 'javascript:void(0)')
        .replace(new RegExp('{{author}}', 'g'), subdata.author || '外星人')
      $(temp).appendTo($header)
      setTimeout(() => {
        $('#comment').trigger('focus')
      }, 200)
    })
  },
  commentLike() {
    $(document).on('click', 'a.comments-like', function (event) {
      if (event) {
        event.preventDefault()
      }
      const $this = $(this)
      const data = $this.parents('.media-body').data('comment_data')
      if (!data || !data.id) {
        return
      }
      const id = data.id
      let StorageData = localStorage.getItem(Comments.Info.like)
      if (StorageData) {
        StorageData = JSON.parse(StorageData)
        if (StorageData.indexOf(id) > -1) {
          return Toast.warn('你已经点过赞了')
        }
      }
      Ajax.get('/CommentLike', {
        id
      }, (base) => {
        if (base.result && base.data) {
          const rd = base.data
          $this.addClass('active').find('span').text(rd.love || 0)
          if (!StorageData) {
            localStorage.setItem(Comments.Info.like, JSON.stringify([id]))
          } else {
            StorageData.push(id)
            localStorage.setItem(Comments.Info.like, JSON.stringify(StorageData))
          }
        }
      })
    })
  },
  cancelRelay() {
    $('#topid').val('0')// 顶级评论id
    $('#superid').val('0')// 回复的id
    if ($('#comments-main-replay').length !== 0) {
      $('#comments-main-replay').remove()
    }
  },
  getCommentCookie() {
    const data = {}
    data.author = Ajax.getCookie(Comments.Info.author)
    data.contact = Ajax.getCookie(Comments.Info.contact)
    data.website = Ajax.getCookie(Comments.Info.website)
    return data
  },
  setLocalStorage(data) {
    let StorageData = localStorage.getItem(Comments.Info.data)
    if (!StorageData) {
      localStorage.setItem(Comments.Info.data, JSON.stringify([data]))
    } else {
      StorageData = JSON.parse(StorageData)
      StorageData.push(data)
      localStorage.setItem(Comments.Info.data, JSON.stringify(StorageData))
    }
  },
  loadComments() {
    const data = $('#comments-data').data()
    let pageNum = data.pageNum
    if (pageNum !== 0 && !pageNum) {
      pageNum = -1
    }
    if (data.pages && pageNum === data.pages - 1) {
      return Comments.endLoading(false, '———— The End ————')
    }
    const contentid = $('#contentid').val() || '0'
    pageNum += 1
    const menuItem = $('#pc-menu').find('li.menu-item.active:first')
    const style = menuItem.data('style') || 'content'
    const alias = menuItem.data('alias')
    Ajax.post('/loadComments', {
      contentid,
      pageNum,
      style,
      alias
    }
    , Comments.InitComments)
  },
  endLoading(hasComment, text) {
    const $commentsLoading = $('#comments-loading')
    if (hasComment) {
      $commentsLoading.remove()
    } else {
      if ($commentsLoading.length === 0) {
        Comments.addLoading(text)
      }
      $commentsLoading.text(text)
    }
  },
  addLoading(text) {
    text = text ? text : '评论加载中&hellip;'
    const loadingTemplate = `<div id="comments-loading" class="text-muted text-center font-13">${text}</div>`
    const $commentsData = $('#comments-data')
    const commentsLoading = $('#comments-loading')
    if (commentsLoading.length === 0) {
      $(loadingTemplate).appendTo($commentsData).offset()
    }
  },
  InitComments(base) {
    // 属于服务内部错误
    if (!base || typeof base !== 'object' || !base.data) {
      return Comments.endLoading(false, '暂无评论')
    }
    // 处理数据结构
    const page = base.data
    // 数据错误
    if (!page || !Tool.isJSON(page) || !page.result || !Tool.isJSON(page.result) || page.result.length === 0) {
      return Comments.endLoading(false, '暂无评论')
    }
    Comments.endLoading(true)
    const list = page.result
    const $commentsData = $('#comments-data')
    let StorageData = localStorage.getItem(Comments.Info.like)
    if (StorageData) {
      StorageData = JSON.parse(StorageData)
    }
    for (const i in list) {
      let temp = Comments.mediaFisrtTemplate
      const item = list[i]
      let ctime = item.ctime
      if (moment) {
        const nowyear = moment().year()
        ctime = moment(ctime, 'YYYY-MM-DD HH:mm:ss')
        if (nowyear === ctime.year()) {
          ctime = ctime.format('MM-DD HH:mm')
        }
      }
      let itemActive = ''
      if (StorageData && StorageData.indexOf(item.id) > -1) {
        itemActive = 'active'
      }
      temp = temp.replace(new RegExp('{{author}}', 'g'), item.author)
        .replace(new RegExp('{{website}}', 'g'), item.website || 'javascript:void(0)')
        .replace(new RegExp('{{active}}', 'g'), itemActive)
        .replace(new RegExp('{{love}}', 'g'), item.love)
        .replace(new RegExp('{{comment}}', 'g'), item.comment)
        .replace(new RegExp('{{ctime}}', 'g'), ctime)
      const $temp = $(temp)
      const $mediaBody = $temp.find('.media-body:first')
      $mediaBody.data('comment_data', item)
      const replys = item.replys
      if (replys) {
        for (const z in replys) {
          let replayTemp = Comments.mediaReplayTemplate
          let superTemp = Comments.superTemplate
          const reply = replys[z]
          let replyTime = reply.ctime
          if (moment) {
            const cnowyear = moment().year()
            replyTime = moment(replyTime, 'YYYY-MM-DD HH:mm:ss')
            if (cnowyear === replyTime.year()) {
              replyTime = replyTime.format('MM-DD HH:mm')
            }
          }
          let replayActive = ''
          if (StorageData && StorageData.indexOf(reply.id) > -1) {
            replayActive = 'active'
          }
          replayTemp = replayTemp.replace(new RegExp('{{author}}', 'g'), reply.author)
            .replace(new RegExp('{{website}}', 'g'), reply.website || 'javascript:void(0)')
            .replace(new RegExp('{{active}}', 'g'), replayActive)
            .replace(new RegExp('{{love}}', 'g'), reply.love)
            .replace(new RegExp('{{comment}}', 'g'), reply.comment)
            .replace(new RegExp('{{ctime}}', 'g'), replyTime)
          if (reply.topid !== '0' && reply.topid !== reply.superid) {
            superTemp = superTemp.replace(new RegExp('{{superauthor}}', 'g'), reply.superauthor || '外星人')
              .replace(new RegExp('{{superwebsite}}', 'g'), reply.superwebsite || 'javascript:void(0)')
          } else {
            superTemp = ''
          }
          replayTemp = replayTemp.replace(new RegExp('{{superauthorTemplate}}', 'g'), superTemp)

          const $replayTemp = $(replayTemp).appendTo($mediaBody)
          $replayTemp.find('.media-body:first').data('comment_data', reply)
        }
      }
      $temp.appendTo($commentsData).initUI()
    }
    $('#comments-nums').text(`(${page.total})`)
    delete page.result
    page.pageNum = page.pageNum > 0 ? page.pageNum - 1 : 0
    $commentsData.data(page)
  }
}
export default Comments
