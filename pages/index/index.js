//index.js
//获取应用实例
import { promisify } from '../../utils/promise.util'
import { $init, $digest } from '../../utils/common.util'
import { apiUrl, imagesUrl } from '../../utils/config'
import { wxComUlit as wxUlit, formData as momentInfo } from '../../utils/comUit'
import { checkVip, checkMemeber, relationShip, favorite } from '../../utils/Biz'
const wxRequst = promisify(wx.request)
const wxUploadFile = promisify(wx.uploadFile)
const getStorge = promisify(wx.getStorage);
const setStorge = promisify(wx.setStorage);
const app = getApp()
Page({
  data: {
    aa: [
      {
        text: "wang收藏了li的作品",
      },
      {
        text: "wang收藏了li的作品",
      },
      {
        text: "wang收藏了li的作品",
      },
      {
        text: "wang收藏了li的作品",
      },
      {
        text: "wang收藏了li的作品",
      },
      {
        text: "wang收藏了li的作品",
      },
      {
        text: "wang收藏了li的作品",
      },
      {
        text: "wang收藏了li的作品",
      },
      {
        text: "wang收藏了li的作品",
      },
      {
        text: "wang收藏了li的作品",
      },
    ],
    page: 0,
    currentTab: 0,
    color: "#8a8a8a",
    view: "#f00",
    currentData: 0,
    momentList: [],
    listCount: 0,
    msgCount: 0,
    listTotal: 0,
    imagesUrl: imagesUrl,
    height: 0, // scroll-wrap 的高度，这个高度是固定的
    inner_height: 0, // inner-wrap 的高度，这个高度是动态的
    start_scroll: 0, // 滚动前的位置。
    touch_down: 0, // 触摸时候的 Y 的位置
    openId: 0
  },
  previewMomentImg: function (e) {
    let that = this;
    let index = e.currentTarget.dataset.index
    let parent = e.currentTarget.dataset.parent
    let imagesUrl = [];
    for (var key in that.data.momentList[parent].imageUrl) {
      imagesUrl.push(`${that.data.imagesUrl}//${that.data.momentList[parent].imageUrl[key]}`)
    }
    wx.previewImage({
      current: e.currentTarget.dataset.src, //当前图片地址
      urls: imagesUrl, //所有要预览的图片的地址集合 数组形式
    })

  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },

  onShow: function () {
    $init(this);
    let count = 0;
    console.log('xxxxx')
    checkMemeber();
    getStorge({ key: 'openId' }).then(
      res => {
        this.data.openId = res.data.openId;
        wxRequst({
          data: { page: this.data.page, openId: this.data.openId },
          url: `${apiUrl}/moments`
        }).then(res => {
          this.data.momentList = res.data.list;
          this.data.listCount = res.data.list.length;
          this.data.listTotal = +res.data.count;
          count = +res.data.msgCount;
          getStorge({ key: 'msgCount' }).then(res => {
            if (count > res.data) {
              this.data.msgCount = res.data;
            } else {
              this.data.msgCount = 0;
            }
            $digest(this);
          }).catch(
            res => {
              this.data.msgCount = count;
              setStorge({ 'key': 'msgCount', data: count })
              $digest(this);
            }
          );


        }).catch(
          res => {
            wx.showToast({
              title: '网络异常',
            })
          });
      }
    ).catch(res => { });

  },
  //获取当前滑块的index
  bindchange: function (e) {
    const that = this;
    that.setData({
      currentData: e.detail.current
    })
  },
  //点击切换，滑块index赋值
  checkCurrent: function (e) {
    const that = this;
    if (that.data.currentData === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentData: e.target.dataset.current
      })
    }
  },
  momentFavourite: function (e) {
    checkVip();
    let index = +e.currentTarget.dataset.index;
    if (this.data.momentList[index].activeFoucs == 0) {
      this.data.momentList[index].activeFoucs = 1;
      favorite(e, this)
    } else {
      wx.showToast({
        title: '已点赞',
      })
    }

  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  yaoyue: function () {
    wx.showModal({
      title: '提示',
      content: '人数已超额，本次邀请将支付98元',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  start_fn(e) {
    let self = this;
    let touch_down = e.touches[0].clientY;
    this.data.touch_down = touch_down;
    // 获取 inner-wrap 的高度
    wx.createSelectorQuery().select('.content-view').boundingClientRect(function (rect) {
      self.data.inner_height = rect.height;
    }).exec();

    // 获取 scroll-wrap 的高度和当前的 scrollTop 位置
    wx.createSelectorQuery().select('.scroll-view-container').fields({
      scrollOffset: true,
      size: true
    }, function (rect) {
      self.data.start_scroll = rect.scrollTop;
      self.data.height = rect.height;
    }).exec();
  },
  end_fn(e) {
    let current_y = e.changedTouches[0].clientY;
    let self = this;
    let { start_scroll, inner_height, height, touch_down } = this.data;
    /**
    * 1、下拉刷新
    * 2、上拉加载
    */
    console.log(current_y);
    if (current_y > touch_down && current_y - touch_down > 20 && start_scroll == 0) {
      this.upper();
      // 下拉刷新 的请求和逻辑处理等
    } else if (current_y < touch_down && touch_down - current_y >= 20) {
      // 上拉加载 的请求和逻辑处理等
      this.onPullDownRefresh();
    }
  },
  onPullDownRefresh: function () {
    var $ = this;
    if (this.data.listCount == this.data.listTotal) {
      return false
    } else {
      wx.showNavigationBarLoading()
      wxRequst({
        data: { page: ++this.data.page, openId: this.data.openId },
        url: `${apiUrl}/moments`
      }).then(res => {

        this.data.momentList = [...this.data.momentList, ...res.data.list]
        this.data.listCount = this.data.momentList.length;
        $digest(this);
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
      }).catch(
        res => {
          wx.showToast({
            title: '网络异常',
          })
        });
    }
  },
  upper: function (e) {
    var $ = this;
    let that = this;
    this.data.page = 0;
    wx.showNavigationBarLoading()
    wxRequst({
      data: { page: 0, openId: this.data.openId },
      url: `${apiUrl}/moments`
    }).then(res => {
      this.data.momentList = res.data.list;
      this.data.listCount = this.data.momentList.length;
      $digest(this);
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
    }).catch(
      res => {
        wx.showToast({
          title: '网络异常',
        })
      });
  },
  getRelation: function (e) {
    checkVip();
    relationShip(e);
  },
  viewDetail: function (e) {
    let type = e.currentTarget.dataset.type;
    let id = e.currentTarget.dataset.id;
    console.log(type);
    if (type == 0) {
      wx.navigateTo({
        url: `../TeacherShow/TeacherShow?id=${id}`,
      })
    } else {
      wx.navigateTo({
        url: `../studentShow/studentShow?id=${id}`,
      })
    }
  },
  modalcnt:function(){
		wx.showModal({
			title: '提示',
			content: '感谢您对大来艺术博物馆的支持，为了您的资金安全，请联系大来博物馆官方热线400-88888888进行购买',
			success: function(res) {
				if (res.confirm) {
				console.log('用户点击确定')
				} else if (res.cancel) {
				console.log('用户点击取消')
				}
			}
		})
	}
})