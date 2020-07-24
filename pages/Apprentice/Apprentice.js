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
    tabTxt: ['全部'],//分类
    tab: [true, true],
    pinpaiList: [{ 'id': '1', 'title': '新上教练' }, { 'id': '2', 'title': '口碑教练' }, { 'id': '3', 'title': '大V教练' }, { 'id': '4', 'title': '其他教练' }],
    currentTab: 0,
    color: "#8a8a8a",
    view: "#f00",
    currentData: 0,
    coachList: [],
    studentList: [],
    imagesUrl: imagesUrl,
    page: 0,
    listTotal: 0,
    listCount: 0,
    height: 0, // scroll-wrap 的高度，这个高度是固定的
    inner_height: 0, // inner-wrap 的高度，这个高度是动态的
    start_scroll: 0, // 滚动前的位置。
    touch_down: 0, // 触摸时候的 Y 的位置
    openId: 0,
    msgCount: 0,
    msgInfo: []
  },
  previewCoachImg: function (e) {
    let that = this;
    let index = e.currentTarget.dataset.index
    let parent = e.currentTarget.dataset.parent
    let imagesUrl = [];
    for (var key in that.data.coachList[parent].imageUrl) {
      imagesUrl.push(`${that.data.imagesUrl}//${that.data.coachList[parent].imageUrl[key]}`)
    }
    wx.previewImage({
      current: e.currentTarget.dataset.src, //当前图片地址
      urls: imagesUrl, //所有要预览的图片的地址集合 数组形式
    })
  },
  previewStudentImg: function (e) {
    let that = this;
    let index = e.currentTarget.dataset.index
    let parent = e.currentTarget.dataset.parent
    wx.previewImage({
      current: e.currentTarget.dataset.src, //当前图片地址
      urls: that.data.studentList[parent].imgArr, //所有要预览的图片的地址集合 数组形式
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
  baishi: function () {
    wx.showModal({
      title: '拜师',
      content: '确定发送拜师信息，需支付服务费￥150元，进度在个人中心消息中查看',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  zhaotu: function () {
    wx.showModal({
      title: '招徒',
      content: '确定发送招徒信息，需支付服务费￥150元，进度在个人中心消息中查看',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  // 选项卡
  filterTab: function (e) {
    var data = [true, true, true], index = e.currentTarget.dataset.index;
    data[index] = !this.data.tab[index];
    this.setData({
      tab: data
    })
  },
  //筛选项点击操作
  filter: function (e) {
    var self = this, id = e.currentTarget.dataset.id, txt = e.currentTarget.dataset.txt, tabTxt = this.data.tabTxt;
    switch (e.currentTarget.dataset.index) {
      case '0':
        tabTxt[0] = txt;
        self.setData({
          tab: [true, true, true],
          tabTxt: tabTxt,
          pinpai_id: id,
          pinpai_txt: txt
        });
        break;
      case '1':
        tabTxt[1] = txt;
        self.setData({
          tab: [true, true, true],
          tabTxt: tabTxt,
          jiage_id: id,
          jiage_txt: txt
        });
        break;
      case '2':
        tabTxt[2] = txt;
        self.setData({
          tab: [true, true, true],
          tabTxt: tabTxt,
          xiaoliang_id: id,
          xiaoliang_txt: txt
        });
        break;
    }
    //数据筛选
    self.getDataList();
  },

  onLoad: function (options) {
    $init(this)
    if ((typeof (options.type) != "undefined")) {
      this.data.currentTab = options.type;

    }
    if (this.data.currentTab == 2) {
      let count = 0
      wxRequst({
        data: null, url: `${apiUrl}/message`
      }).then(res => {
        this.data.msgInfo = res.data.list;
        count = res.data.count;
        getStorge({ key: 'msgCount' }).then(res => {
          if (count > res.data) {
            this.data.msgCount = count;
            setStorge({ 'key': 'msgCount', data: +this.data.msgCount })
          } else {
            this.data.msgCount = 0;
          }
          $digest(this);
        }).catch()
      }).catch();
    } else {
      getStorge({ key: 'openId' }).then(res => {
        this.data.openId = res.data.openId;
        wxRequst({ data: { type: this.data.currentTab, page: this.data.page, openId: res.data.openId }, url: `${apiUrl}/members` }).then(
          res => {
            if (this.data.currentTab == 0) {
              this.data.coachList = res.data.list;
              this.data.listCount = res.data.list.length;
              this.data.listTotal = +res.data.count;
              console.log(this.data);
            } else {
              this.data.studentList = res.data.list;
              this.data.listCount = res.data.list.length;
              this.data.listTotal = +res.data.count;
            }
            $digest(this);
          }).catch(
            res => {
            });
      }).catch(res => { });
    }


  },
  //获取当前滑块的index
  bindchange: function (e) {
    const that = this;
    that.setData({
      currentData: e.detail.current
    })
  },
  coachLike: function (e) {
    checkVip();
    let index = +e.currentTarget.dataset.index;
    if (this.data.coachList[index].activeFoucs == 0) {
      this.data.coachList[index].activeFoucs = 1;
      favorite(e, this, 1)
    } else {
      wx.showToast({
        title: '已点赞',
      })
    }
  },
  studentLike: function (e) {
    checkVip();
    let index = +e.currentTarget.dataset.index;
    if (this.data.studentList[index].activeFoucs == 0) {
      favorite(e, this, 2)
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
  //点击切换
  clickTab: function (e) {
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      this.data.currentTab = e.target.dataset.current;
      if (this.data.currentTab == 2) {
        wxRequst({
          data: null, url: `${apiUrl}/message`
        }).then(res => {
          this.data.msgInfo = res.data.list;
          this.data.msgCount = res.data.count;
          setStorge({ 'key': 'msgCount', data: this.data.msgCount })
          $digest(this);
        }).catch(res => { });
      } else {
        $digest(this);
        this.data.page = 0;
        let options = { type: e.target.dataset.current };
        this.onLoad(options);
      }


    }

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
    if (current_y > touch_down && current_y - touch_down > 20 && start_scroll == 0) {
      this.upper();
      // 下拉刷新 的请求和逻辑处理等
    } else if (current_y < touch_down) {
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
      wxRequst({ data: { type: this.data.currentTab, page: ++this.data.page, openId: this.data.openId }, url: `${apiUrl}/members` }).then(
        res => {
          if (+this.data.currentTab == 0) {
            this.data.coachList = [...this.data.coachList, ...res.data.list]
            this.data.listCount = this.data.coachList.length;
          } else {
            this.data.studentList = [...this.data.studentList, ...res.data.list]
            this.data.listCount = this.data.studentList.length;
          }
          $digest(this);
          wx.hideNavigationBarLoading() //完成停止加载
          wx.stopPullDownRefresh() //停止下拉刷新
        }).catch(
          res => {
          });
    }
  },
  upper: function (e) {
    var $ = this;
    let that = this;
    this.data.page = 0;
    wx.showNavigationBarLoading()
    wxRequst({
      data: { type: this.data.currentTab, page: this.data.page, openId: this.data.openId },
      url: `${apiUrl}/members`
    }).then(res => {
      if (this.data.currentTab == 0) {
        this.data.coachList = res.data.list
        this.data.listCount = res.data.list.length;
      } else {
        this.data.studentList = res.data.list
        this.data.listCount = res.data.list.length;
      }
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
    relationShip(e);
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